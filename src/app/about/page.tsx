import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const description = `Learn more about Live Football TV Guide, your ultimate source for live football schedules, TV broadcasters, and betting odds on ${dateString}. Our mission is to help football fans never miss a game.`;
  
  return {
    title: "About Us | Live Football TV Guide",
    description,
    keywords: `about us, live football, TV guide, football schedules, betting odds, ${dateString}`,
    openGraph: {
      title: "About Us | Live Football TV Guide",
      description,
      type: 'website',
    },
    twitter: {
      title: "About Us | Live Football TV Guide",
      description,
    },
  };
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
      <h1>About Us</h1>
      <section>
        <h2>Our Mission</h2>
        <p>
          Briefly describe the purpose of your website or company. What problem are you solving? What value do you provide to your users?
        </p>
      </section>
      <section>
        <h2>Who We Are</h2>
        <p>
          Introduce your team, founders, or organization. You can mention your background, expertise, or what inspired you to start this project.
        </p>
      </section>
      <section>
        <h2>Our Story</h2>
        <p>
          Share a short story about how your project or company started, key milestones, or what makes your journey unique.
        </p>
      </section>
      <section>
        <h2>What We Offer</h2>
        <p>
          Summarize the main features or services your website provides. Highlight what sets you apart from others.
        </p>
      </section>
      <section>
        <h2>Contact Us</h2>
        <p>
          Let users know how they can reach you for questions, feedback, or support. (You can link to your Contact page here.)
        </p>
      </section>
      <section>
        <h2>Follow Us</h2>
        <p>
          (Optional) Add links to your social media profiles or newsletter if you have them.
        </p>
      </section>
    </main>
  );
} 