customElements.define(
  "semantic-cv-theme-matilda",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <div class="desktop">
          <div class="cv">
            <aside></aside>
            <main></main>
          </div>
        </div>
      `;
    }

    updateAsideRight() {
      const aside = this.querySelector("aside");
      const right = aside.getBoundingClientRect().right;
      document.documentElement.style.setProperty("--aside-right", `${right}px`);
    }

    connectedCallback() {
      this._onWindowResize = () => this.updateAsideRight();
      window.addEventListener("resize", this._onWindowResize);

      this._resizeObserver = new ResizeObserver(() => {
        this.updateAsideRight();
      });

      const aside = this.querySelector("aside");
      this._resizeObserver.observe(aside);

      this.updateAsideRight();
    }

    disconnectedCallback() {
      window.removeEventListener("resize", this._onWindowResize);
      this._resizeObserver.disconnect();
    }

    photo() {
      const { image, name } = this.person;
      if (image) {
        const section = document.createElement("section");
        section.setAttribute("class", "photo");
        const img = document.createElement("img");
        img.setAttribute("src", image);
        img.setAttribute("alt", name ?? "");
        section.appendChild(img);
        return section;
      }
    }

    contactDetails() {
      function linkText(url) {
        if (url.indexOf("mailto:") > -1 || url.indexOf("tel:") > -1) {
          return url.substring(url.indexOf(":") + 1);
        }

        const text = url.substring(url.indexOf("://") + 3).replace("www.", "");
        return text.length > 26 ? text.substring(0, 25) + "…" : text;
      }
      const { email, telephone, url, sameAs } = this.person;
      const links = super.normalizeArray(
        sameAs,
        url,
        email ? `mailto:${email}` : undefined,
        telephone ? `tel:${telephone}` : undefined,
      );
      if (links.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Contact Details</h2>
          <ul>${links.map((link) => `<li><a href="${link}" title="${link}"><span>${linkText(link)}</span>${super.faIcon(link)}</a></li>`).join("")}</ul>
        `;
        return section;
      }
    }

    knowsAbout() {
      const { knowsAbout } = this.person;
      if (knowsAbout.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Competencies</h2>
          <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("")}</ul>
        `;
        return section;
      }
    }

    skills() {
      const { skills } = this.person;
      if (skills.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Skills</h2>
          <ul>${skills.map((item) => `<li>${item}</li>`).join("")}</ul>
        `;
        return section;
      }
    }

    languages() {
      const { knowsLanguage } = this.person;
      if (knowsLanguage) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Languages</h2>
          <ul>${knowsLanguage.map((language) => `<li>${language}</li>`).join("")}</ul>
        `;
        return section;
      }
    }

    certifications() {
      const certs = [
        ...this.person.hasCertification,
        ...this.person.hasCredential,
      ];
      if (certs.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Certifications</h2>
          <ul>${certs.map((cert) => `<li>${cert.name}</li>`).join("")}</ul>
        `;
        return section;
      }
    }

    experience(xp) {
      const { roleName, startDate, endDate, description, worksFor, alumniOf } =
        xp;
      const { name, location } = worksFor || alumniOf;
      const period =
        startDate || endDate
          ? `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
          `
          : undefined;
      return `
        <article>
          <h3>${name ?? ""}</h3>
          <ul class="caption">
            ${roleName ? `<li>${roleName}</li>` : ""}
            ${period ? `<li>${period}</li>` : ""}
            ${location ? `<li>${location}</li>` : ""}
          </ul>
          <p>${description ?? ""}</p>
        </article>
      `;
    }

    professionalExperience() {
      const { worksFor } = this.person;
      if (worksFor.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Professional experience</h2>
          ${worksFor.map(this.experience).join("")}
        `;
        return section;
      }
    }

    education() {
      const { alumniOf } = this.person;
      if (alumniOf.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Education</h2>
          ${alumniOf.map(this.experience).join("")}
        `;
        return section;
      }
    }

    projects() {
      const { projects } = this.person;
      if (projects.length) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Projects</h2>
          ${projects.map(this.experience).join("")}
        `;
        return section;
      }
    }

    lifeEvents() {
      function lifeEvent(e) {
        return `  
          <div>
            ${e.name ? `<h3>${e.name}</h3>` : ""}
            ${e.startDate ? `<time datetime="${e.startDate}">${e.startDate}</time>` : ""}
            ${e.location && e.location.name ? `<span>${e.location.name}</span>` : ""}
          </div>
        `;
      }
      const lifeEvents = this.person.lifeEvent;
      if (lifeEvents.length) {
        const section = document.createElement("section");
        section.setAttribute("class", "life-events");
        section.innerHTML = `
          <h2>Life events</h2>
          <ul>${lifeEvents.map((e) => `<li>${lifeEvent(e)}`).join("")}</ul>
        `;
        return section;
      }
    }

    header() {
      const cv = this.person;
      const header = document.createElement("header");

      const top = document.createElement("div");
      header.innerHTML = `<h1>${cv.name ?? ""}</h1>`;
      header.appendChild(top);

      const bottom = document.createElement("div");
      bottom.innerHTML = cv.jobTitle ?? "";

      header.appendChild(bottom);

      return header;
    }

    description() {
      const cv = this.person;
      if (cv.description) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Professional summary</h2>
          <div>${cv.description}</div>
        `;
        return section;
      }
    }

    renderAside(elements) {
      const aside = this.querySelector("aside");
      for (const element of elements) {
        if (element) {
          aside.appendChild(element);
        }
      }
    }

    renderMain(elements) {
      const main = this.querySelector("main");
      for (const element of elements) {
        if (element) {
          main.appendChild(element);
        }
      }
    }

    render() {
      this.renderAside([
        this.photo(),
        this.header(),
        this.contactDetails(),
        this.knowsAbout(),
        this.skills(),
        this.languages(),
        this.certifications(),
      ]);
      this.renderMain([
        this.header(),
        this.description(),
        this.projects(),
        this.professionalExperience(),
        this.education(),
        this.lifeEvents(),
      ]);
    }
  },
);
