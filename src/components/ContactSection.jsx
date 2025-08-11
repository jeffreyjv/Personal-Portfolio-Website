import {
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Get In <span className="text-primary"> Touch</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Feel free to reach out!
          I'm always open to discussing new opportunities.
        </p>

        <div className="space-y-10 max-w-md mx-auto">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Contact Information
            </h3>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Email</h4>
                  <a
                    href="mailto:jeffreyj.vincent@yahoo.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    jeffreyj.vincent@yahoo.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4 justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Phone</h4>
                  <a
                    href="tel:+17045416747"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +1 (704) 541-6747
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4 justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">Charlotte, NC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-medium mb-4 text-center">Connect With Me</h4>
            <div className="flex space-x-6 justify-center text-primary">
              <a
                href="https://www.linkedin.com/in/jeffreyvincent-796/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={28} />
              </a>
              <a
                href="https://www.instagram.com/jeffreyjv/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={28} />
              </a>
              <a
                href="https://www.youtube.com/@jeffreyjv"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube size={28} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
