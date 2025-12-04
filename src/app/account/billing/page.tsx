import { redirect } from 'next/navigation'

// Billing functionality has been integrated into the Orders page
export default function BillingPage() {
    redirect('/account/orders')
}