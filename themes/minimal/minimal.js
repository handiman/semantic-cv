customElements.define(
  "semantic-cv-theme-minimal",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <div class="wrapper">      
          <aside></aside>
          <main></main>
        </div>
      `;
      this.aside = this.querySelector("aside");
      this.main = this.querySelector("main");
    }

    photo() {
      const { image, name } = this.person;
      if (image) {
        const img = document.createElement("img");
        img.setAttribute("src", image);
        img.setAttribute("alt", name ?? "");
        return img;
      }
    }

    knowsAbout() {
      const { knowsAbout } = this.person;
      if (knowsAbout.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Core Competencies</h2>
          <ul>${knowsAbout.map((thing) => `<li>${thing}</li>`).join("\n")}</ul>
        `;
        return section;
      }
    }

    skills() {
      const { skills } = this.person;
      if (skills.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Tech Skills</h2>
          <ul>${skills.map((skill) => `<li>${skill}</li>`).join("\n")}</ul>
        `;
        return section;
      }
    }

    hero() {
      const {
        name,
        jobTitle,
        hasOccupation,
        description,
        sameAs,
        url,
        email,
        telephone,
      } = this.person;
      const urls = super.normalizeArray(
        sameAs,
        url,
        email ? `mailto:${email}` : undefined,
        telephone ? `tel:${telephone}` : undefined,
      );
      const header = document.createElement("header");
      header.innerHTML = `
        ${name ? `<h1>${name}</h1>` : ""}
        ${jobTitle || hasOccupation ? `<div>${jobTitle ? jobTitle : hasOccupation.name}</div>` : ""}
        ${description ? `<div>${description}</div>` : ""}
        ${urls.length > 0 ? `<ul>${urls.map((link) => `<li><a href="${link}">${super.faIcon(link)}</a></li>`).join("\n")}</ul>` : ""}
      `;

      return header;
    }

    hasCredential() {
      const certs = [
        ...this.person.hasCertification,
        ...this.person.hasCredential,
      ];
      if (certs.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Certifications</h2>
          <ul>${certs.map((cred) => `<li>${cred.name}</li>`).join("\n")}</ul>
        `;
        return section;
      }
    }

    knowsLanguage() {
      function language(language) {
        const languageName =
          typeof language === "string" ? language : language.name;
        return `<div>${languageName}</div>`;
      }
      const { knowsLanguage } = this.person;
      if (knowsLanguage.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Languages</h2>
          ${knowsLanguage.map(language).join("\n")}
        `;
        return section;
      }
    }

    lifeEvent() {
      function lifeEvent(event) {
        return `
          <li>
            ${event.name ? `<div>${event.name}</div>` : ""}
            ${
              event.startDate || (event.location && event.location.name)
                ? `
              <div>
                ${event.startDate ? `${event.startDate}` : ""}
                ${event.location && event.location.name ? `${event.location.name}` : ""}
              </div>`
                : ""
            }
            ${event.description ? `<div>${event.description}</div>` : ""}
          </li>
        `;
      }
      const lifeEvents = this.person.lifeEvent;
      if (lifeEvents.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
          <h2>Life Events</h2>
          <ul>${lifeEvents.map(lifeEvent).join("\n")}</ul>
        `;
        return section;
      }
    }

    work() {
      function xp(role) {
        const { startDate, endDate, roleName, description, worksFor } = role;
        const { name, location } = worksFor ?? {};
        function period() {
          if (startDate || endDate) {
            return `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
        `;
          }
        }
        function header() {
          const span = period();
          return `
            ${name ? `<h3>${name}</h3>` : ""}
            <ul>
              ${roleName ? `<li>${roleName}</li>` : ""}
              ${span ? `<li>${span}</li>` : ""}
              ${location ? ` <li>${location}</li>` : ""}
            </ul>
          `;
        }

        return `
          <article part="article">
            ${header() ?? ""}
            ${description ? `<p>${description}<p>` : ""}
          </article>
        `;
      }
      const { worksFor } = this.person;
      if (worksFor.length > 0) {
        const section = document.createElement("section");
        section.setAttribute("class", "work");
        section.innerHTML = `
          <h2>Professional Experience</h2>
          ${worksFor.map(xp).join("\n")}
        `;
        return section;
      }
    }

    education() {
      const { alumniOf } = this.person;
      if (alumniOf.length > 0) {
        const section = document.createElement("section");
        section.setAttribute("class", "education");
        section.innerHTML = `
          <h2>Education</h2>
          <ul>${alumniOf
            .map((item) => {
              const { description, alumniOf } = item;
              const { name } = alumniOf ?? {};
              return `
                <li>
                  ${name ? `<strong>${name}</strong>` : ""}
                  ${description ? `${description}` : ""}
                </li>
              `;
            })
            .join("\n")}
          </ul>
        `;
        return section;
      }
    }

    projects() {
      const { projects } = this.person;
      if (projects.length) {
        const section = document.createElement("section");
        section.setAttribute("class", "projects");
        section.innerHTML = `
          <h2>Projects</h2>
          <ul>${projects
            .map((item) => {
              const { description, worksFor } = item;
              const { name } = worksFor ?? {};
              return `
                <li>
                  ${name ? `<strong>${name}</strong>` : ""}
                  ${description ? `${description}` : ""}
                </li>
              `;
            })
            .join("\n")}
          </ul>
        `;
        return section;
      }
    }

    renderAside(elements) {
      for (const element of elements) {
        if (element) {
          this.aside.appendChild(element);
        }
      }
    }

    renderMain(elements) {
      for (const element of elements) {
        if (element) {
          this.main.appendChild(element);
        }
      }
    }

    render() {
      this.renderAside([
        this.photo(),
        this.knowsAbout(),
        this.skills(),
        this.hasCredential(),
        this.knowsLanguage(),
      ]);

      this.renderMain([
        this.hero(),
        this.projects(),
        this.work(),
        this.education(),
        this.lifeEvent(),
      ]);
    }
  },
);
