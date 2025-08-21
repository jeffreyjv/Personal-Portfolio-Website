import { Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from "lucide-react";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        {/* Main Card */}
        <div className="bg-card p-12 rounded-3xl shadow-xl flex flex-col space-y-12 text-center">
          
          {/* Heading */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-muted-foreground">
              I'm always open to discussing new opportunities, collaborations, or just saying hi!
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Email</h4>
              <a
                href="mailto:jeffreyj.vincent@yahoo.com"
                className="text-muted-foreground hover:text-primary transition-colors break-words"
              >
                jeffreyj.vincent@yahoo.com
              </a>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Phone</h4>
              <a
                href="tel:+17045416747"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                +1 (704) 541-6747
              </a>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Location</h4>
              <p className="text-muted-foreground">Charlotte, NC</p>
            </div>
          </div>

          {/* LinkedIn Callout */}
          <div className="bg-primary/10 p-6 rounded-xl flex flex-col items-center space-y-3">
            <Linkedin size={36} className="text-primary" />
            <h4 className="font-semibold text-lg">LinkedIn</h4>
            <p className="text-muted-foreground">
              View my professional profile for experience, projects, and endorsements.
            </p>
            <a
              href="https://www.linkedin.com/in/jeffreyvincent-796/"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-button mt-2"
            >
              Visit LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
