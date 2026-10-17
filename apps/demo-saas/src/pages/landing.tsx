import {
  Cta,
  Faq,
  FeatureGrid,
  Hero,
  LogoCloud,
  Pricing,
  SiteFooter,
  Stats,
  Testimonials,
} from '@glyphui/blocks'
import { Badge, Button, Navbar } from '@glyphui/ui'
import { ArrowRight, BarChart3, Globe, Lock, Receipt, RefreshCw, Zap } from 'lucide-react'
import { Link } from 'react-router'

const logos = ['Northwind', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Vandelay']

export function LandingPage() {
  return (
    <>
      <Navbar
        brand={<span className="font-display text-h5 font-semibold">Ledgerline</span>}
        links={[
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/app">Open app</Link>
            </Button>
          </>
        }
      />
      <main>
        <Hero
          eyebrow={
            <Badge tone="primary" dot>
              New · Usage-based billing
            </Badge>
          }
          title="Invoices that send themselves"
          description="Ledgerline turns usage data into accurate invoices, chases late payments, and syncs everything to your books."
          actions={
            <>
              <Button size="lg" rightIcon={<ArrowRight />} asChild>
                <Link to="/app">Start free trial</Link>
              </Button>
              <Button size="lg" variant="outline">
                Book a demo
              </Button>
            </>
          }
          footnote="14-day trial. No credit card required."
        />
        <LogoCloud
          title="Trusted by finance teams at"
          logos={logos.map((name) => ({
            name,
            logo: <span className="font-display text-h4 tracking-tight">{name}</span>,
          }))}
        />
        <div id="features">
          <FeatureGrid
            eyebrow="Why Ledgerline"
            title="Billing that keeps up with your product"
            description="Price by seats, usage or both. Change plans without touching code."
            columns={3}
            features={[
              {
                icon: <RefreshCw />,
                title: 'Automatic retries',
                description:
                  'Failed payments retry on a smart schedule and email the right person.',
              },
              {
                icon: <BarChart3 />,
                title: 'Revenue reports',
                description: 'MRR, churn and expansion, reconciled with your bank every night.',
              },
              {
                icon: <Lock />,
                title: 'SOC 2 Type II',
                description: 'Audited controls, SSO and audit logs on every plan.',
              },
              {
                icon: <Receipt />,
                title: 'Branded invoices',
                description: 'Your logo, your domain, 135 currencies and local tax rules.',
              },
              {
                icon: <Zap />,
                title: 'Usage metering',
                description: 'Send events from your API; we roll them up into line items.',
              },
              {
                icon: <Globe />,
                title: 'Local payments',
                description: 'Cards, bank debits and wallets in 46 countries.',
              },
            ]}
          />
        </div>
        <Stats
          variant="cards"
          align="center"
          items={[
            { label: 'Invoices sent last month', value: '1.2M' },
            { label: 'Average days to get paid', value: '9', description: 'Down from 31' },
            { label: 'Uptime, trailing 12 months', value: '99.99%' },
          ]}
        />
        <div id="pricing">
          <Pricing
            eyebrow="Pricing"
            title="Simple plans that grow with you"
            description="Start free. Upgrade when you send more than 50 invoices a month."
            defaultBilling="yearly"
            billingLabels={{ monthly: 'Monthly', yearly: 'Yearly · save 20%' }}
            tiers={[
              {
                name: 'Starter',
                description: 'For freelancers.',
                price: 0,
                features: ['50 invoices a month', 'Card and bank payments', 'Email support'],
                cta: { label: 'Start free', href: '/sign-in' },
              },
              {
                name: 'Growth',
                description: 'For teams billing on usage.',
                price: { monthly: 49, yearly: 39 },
                features: [
                  'Unlimited invoices',
                  'Usage-based pricing',
                  'Dunning and retries',
                  'Revenue reports',
                ],
                cta: { label: 'Start 14-day trial', href: '/sign-in' },
                highlighted: true,
                badge: 'Most popular',
              },
              {
                name: 'Enterprise',
                description: 'For finance teams.',
                price: 'Custom',
                features: ['SSO and SCIM', 'Custom contracts', 'Dedicated support engineer'],
                cta: { label: 'Talk to sales', href: '#contact' },
              },
            ]}
          />
        </div>
        <Testimonials
          title="Finance teams sleep better"
          items={[
            {
              quote: 'We closed the books two days faster the first month.',
              author: { name: 'Priya Raman', title: 'Controller, Northwind' },
            },
            {
              quote: 'Usage billing used to be a spreadsheet. Now it is a webhook.',
              author: { name: 'Tomás Ortega', title: 'CTO, Initech' },
            },
            {
              quote: 'Late payments dropped by a third without a single awkward email.',
              author: { name: 'Hannah Becker', title: 'COO, Umbrella' },
            },
          ]}
        />
        <div id="faq">
          <Faq
            layout="split"
            eyebrow="Support"
            title="Before you start"
            items={[
              {
                question: 'Is there a free trial?',
                answer: 'Growth comes with a 14-day trial. Starter is free forever.',
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes. You keep access until the end of the billing period.',
              },
              {
                question: 'Where is my data stored?',
                answer: 'In the EU or US, your choice, on SOC 2 audited infrastructure.',
              },
            ]}
          />
        </div>
        <Cta
          title="Send your next invoice in five minutes"
          description="Connect your payment provider, pick a template, and you’re done."
          actions={
            <Button size="lg" asChild>
              <Link to="/app">Start free</Link>
            </Button>
          }
        />
      </main>
      <SiteFooter
        brand={<span className="font-display text-h4">Ledgerline</span>}
        tagline="Billing and invoicing for software companies."
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Pricing', href: '#pricing' },
              { label: 'Changelog', href: '#changelog' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#about' },
              { label: 'Careers', href: '#careers' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#privacy' },
              { label: 'Terms', href: '#terms' },
            ],
          },
        ]}
        copyright="© 2026 Ledgerline, Inc."
      />
    </>
  )
}
