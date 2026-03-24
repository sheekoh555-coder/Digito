import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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
            const { error } = await supabase
              .from('orders')
              .insert([
                {
                  product_id: productId,
                  user_id: userId || null,
                  amount: amount,
                  price: amount,
                  status: 'completed',
                  stripe_session_id: session.id,
                  customer_email: session.customer_details?.email || null
                }
              ]);

            if (error) {
              console.error('Error inserting order:', error);
            } else {
              console.log('Order created successfully for session:', session.id);
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
        success_url: `${origin || process.env.APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin || process.env.APP_URL || 'http://localhost:3000'}/product/${productId}`,
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

      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        const productId = session.metadata?.productId;
        const userId = session.metadata?.userId;
        const amount = session.amount_total ? session.amount_total / 100 : 0;

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
            }
          }
        }
        
        return res.json({ success: true, session });
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
