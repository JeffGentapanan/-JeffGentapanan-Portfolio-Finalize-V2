export function ContactPage() {
  return (
    <section className="personal-section" aria-labelledby="contact-title">
      <p className="eyebrow">Start a conversation</p>
      <h2 id="contact-title">
        Have something
        <br />
        <em>in mind?</em>
      </h2>
      <div className="contact-columns">
        <div>
          <p className="personal-lead">
            I’m open to new opportunities and collaborations. Let’s talk.
          </p>
          <a className="contact-email" href="mailto:jeff.gentapanan2004525@gmail.com">
            jeff.gentapanan2004525@gmail.com ↗
          </a>
          <a className="contact-phone" href="tel:+639944935058">
            09944935058
          </a>
          <p className="muted">Philippines</p>
          <a
            className="text-button"
            href="https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn profile ↗
          </a>
        </div>
        <form
          className="jeff-contact-form"
          action="https://formsubmit.co/jeff.gentapanan2004525@gmail.com"
          method="POST"
        >
          <label htmlFor="contact-name">
            Name
            <input id="contact-name" name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label htmlFor="contact-email">
            Email
            <input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label htmlFor="contact-message">
            Message
            <textarea id="contact-message" name="message" rows={5} required maxLength={5000} />
          </label>
          <p className="muted">Your message is sent to Jeff through FormSubmit.</p>
          <button className="button solid" type="submit">
            Send message ↗
          </button>
        </form>
      </div>
    </section>
  );
}
