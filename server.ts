import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  
  // Webhook needs raw body, so we separate it
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      const stripe = getStripe();
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } else {
        // If no webhook secret is configured, just parse the body
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const productId = session.metadata?.productId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      if (productId) {
        try {
          // Check if order already exists for this session
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

          if (!existingOrder) {
            // Insert new order
            const { error: insertError } = await supabase
              .from('orders')
              .insert([
                {
                  product_id: productId,
                  user_id: userId === 'anonymous' ? null : userId,
                  amount: amount,
                  price: amount,
                  status: 'completed',
                  stripe_session_id: session.id,
                  customer_email: session.customer_details?.email || null
                }
              ]);

            if (insertError) {
              console.error('Error inserting order:', insertError);
            } else {
              console.log('Order created successfully for session:', session.id);
              
              // Get product to find seller_id
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('seller_id')
                .eq('id', productId)
                .single();
                
              if (productData?.seller_id) {
                // Calculate seller earnings (price minus 10% commission)
                const sellerEarnings = amount * 0.9;
                
                // Fetch current wallet balance
                const { data: sellerProfile, error: profileError } = await supabase
                  .from('profiles')
                  .select('wallet_balance')
                  .eq('id', productData.seller_id)
                  .single();
                  
                if (sellerProfile) {
                  const currentBalance = sellerProfile.wallet_balance || 0;
                  const newBalance = currentBalance + sellerEarnings;
                  
                  // Update wallet balance
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ wallet_balance: newBalance })
                    .eq('id', productData.seller_id);
                    
                  if (updateError) {
                    console.error('Error updating seller wallet balance:', updateError);
                  } else {
                    console.log(`Updated seller ${productData.seller_id} wallet balance to ${newBalance}`);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error processing webhook order:', err);
        }
      }
    }

    res.json({ received: true });
  });

  // Regular JSON body parser for other API routes
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { productId, price, title, userId, origin, currency = 'usd' } = req.body;

      if (!productId || !price || !title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: title,
              },
              unit_amount: Math.round(price * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin || 'http://localhost:3000'}/cancel`,
        metadata: {
          productId,
          userId: userId || 'anonymous',
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/verify-session', async (req, res) => {
    try {
      const { session_id } = req.body;
      if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        const productId = session.metadata?.productId;
        const userId = session.metadata?.userId;
        const amount = session.amount_total ? session.amount_total / 100 : 0;
        let downloadUrl = null;

        if (productId) {
          // Check if order already exists for this session
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

          if (!existingOrder) {
            // Insert new order
            const { error } = await supabase
              .from('orders')
              .insert([
                {
                  product_id: productId,
                  user_id: userId === 'anonymous' ? null : userId,
                  amount: amount,
                  price: amount,
                  status: 'completed',
                  stripe_session_id: session.id,
                  customer_email: session.customer_details?.email || null
                }
              ]);

            if (error) {
              console.error('Error inserting order during verification:', error);
            } else {
              // Get product to find seller_id
              const { data: productData } = await supabase
                .from('products')
                .select('seller_id')
                .eq('id', productId)
                .single();
                
              if (productData?.seller_id) {
                // Calculate seller earnings (price minus 10% commission)
                const sellerEarnings = amount * 0.9;
                
                // Fetch current wallet balance
                const { data: sellerProfile } = await supabase
                  .from('profiles')
                  .select('wallet_balance')
                  .eq('id', productData.seller_id)
                  .single();
                  
                if (sellerProfile) {
                  const currentBalance = sellerProfile.wallet_balance || 0;
                  const newBalance = currentBalance + sellerEarnings;
                  
                  // Update wallet balance
                  await supabase
                    .from('profiles')
                    .update({ wallet_balance: newBalance })
                    .eq('id', productData.seller_id);
                }
              }
            }
          }

          // Generate signed URL for the product file
          const { data: productData } = await supabase
            .from('products')
            .select('file_url')
            .eq('id', productId)
            .single();

          if (productData?.file_url) {
            // Create a signed URL valid for 24 hours (86400 seconds)
            const { data: signedUrlData, error: signedUrlError } = await supabase
              .storage
              .from('product-files')
              .createSignedUrl(productData.file_url, 86400);

            if (signedUrlError) {
              console.error('Error generating signed URL:', signedUrlError);
            } else if (signedUrlData) {
              downloadUrl = signedUrlData.signedUrl;
            }
          }
        }
        
        return res.json({ success: true, session, downloadUrl });
      } else {
        return res.json({ success: false, status: session.payment_status });
      }
    } catch (error: any) {
      console.error('Error verifying session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
