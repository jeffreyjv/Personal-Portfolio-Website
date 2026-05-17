import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "jeffreyj.vincent@yahoo.com",
    href: "mailto:jeffreyj.vincent@yahoo.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (704) 541-6747",
    href: "tel:+17045416747",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Charlotte, NC",
    href: null,
  },
];

export const ContactSection = () => {
  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">
            Say Hello
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
            Let's Connect
          </h2>
          <p className="text-base text-muted max-w-md mx-auto mb-16 leading-relaxed">
            Always open to new opportunities, collaborations, or just a good conversation.
          </p>
        </ScrollReveal>

        {/* Contact info row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {contactItems.map((item, i) => (
            <ScrollReveal key={item.label} delay={i * 80}>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow duration-300">
                <div className="p-3 rounded-full bg-surface border border-border">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm text-foreground hover:text-primary transition-colors break-words"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-sm text-foreground">{item.value}</span>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* LinkedIn callout */}
        <ScrollReveal delay={240}>
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="p-3 rounded-full bg-primary/10 inline-flex mb-5">
              <Linkedin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">Connect on LinkedIn</h3>
            <p className="text-sm text-muted mb-6">
              View my professional profile for experience, certifications, and endorsements.
            </p>
            <a
              href="https://www.linkedin.com/in/jeffreyvincent-796/"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-primary"
            >
              Visit LinkedIn
            </a>
          </div>
        </ScrollReveal>

        {/* Footer */}
        <ScrollReveal delay={300}>
          <p className="text-xs text-muted mt-16">
            © {new Date().getFullYear()} Jeffrey Vincent. All rights reserved.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
