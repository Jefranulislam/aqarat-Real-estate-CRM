import { ContactForm } from "@/components/contacts/contact-form"

export default function NewContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Contact</h1>
        <p className="text-muted-foreground">Create a new contact in your database</p>
      </div>

      <ContactForm />
    </div>
  )
}
