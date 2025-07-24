export const metadata = {
  title: "Contact | Live Football TV Guide",
  description: "Contact Live Football TV Guide for questions, feedback, or support.",
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
      <h1>Contact Us</h1>
      <section>
        <h2>Get in Touch</h2>
        <p>
          Have questions, feedback, or need support? Reach out to us using the information below or fill out our contact form (coming soon).
        </p>
      </section>
      <section>
        <h2>Email</h2>
        <p>
          <a href="mailto:info@example.com">info@example.com</a> (replace with your real contact email)
        </p>
      </section>
      <section>
        <h2>Other Ways to Contact</h2>
        <p>
          (Optional) Add phone number, address, or social media links here.
        </p>
      </section>
    </main>
  );
} 