customElements.define(
  "semantic-cv-theme-winter",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <header>
          <div>
          </div>
        </header>
        <div>
            <main>
            </main>
        </div>
     `;
      this.main = this.querySelector("main");
      this.header = this.querySelector("header div");
    }

    xp(role) {
      const { startDate, endDate, roleName, description, worksFor, alumniOf } =
        role;
      const { name, location } = worksFor ?? alumniOf ?? {};
      function period() {
        if (startDate || endDate) {
          return `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
        `;
        }
      }
      function caption() {
        const span = period();
        return `
        ${name ? `<h3>${name}</h3>` : ""}
        <ul class="caption">
          ${roleName ? `<li>${roleName}</li>` : ""}
          ${span ? `<li>${span}</li>` : ""}
          ${location ? ` <li>${location}</li>` : ""}
        </ul>
      `;
      }
      return `
    <article>
        ${caption() ?? ""}
        ${description ? `<p>${description}<p>` : ""}
    </article>
`;
    }

    renderHeader() {
      const { image, name, jobTitle, email, telephone } = this.person;
      this.header.innerHTML = `
        <div class="image">
          ${image ? `<img src="${image}" alt="${name ?? ""}" />` : ""}
        </div>
        <div class="title">
          <h1>${name ?? ""}</h1>
          ${jobTitle ? `<div>${jobTitle}</div>` : ""}
          <ul>
            ${email ? `<li><a href="mailto:${email}"><i class="fas fa-envelope"></i>${email}</a></li>` : ""}
            ${telephone ? `<li><a href="tel:${telephone}"><i class="fas fa-phone"></i>${telephone}</a></li>` : ""}
          </ul>
        </title>
      `;
    }

    renderBasics() {
      const {
        description,
        knowsAbout,
        skills,
        knowsLanguage,
        hasCertification,
        hasCredential,
      } = this.person;
      const certs = [...(hasCertification ?? []), ...(hasCredential ?? [])];
      const section = document.createElement("section");
      section.innerHTML = `
        <h2>Professional Summary</h2>
        ${description ? `<p>${description}</p>` : ""}
        <div class="grid"></div>
      `;
      const grid = section.querySelector(".grid");

      if (knowsAbout.length > 0) {
        const knowsElement = document.createElement("section");
        knowsElement.innerHTML = `
          <h2>Core Compentencies</h2>
          <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("\n")}</ul>
        `;
        grid.appendChild(knowsElement);
      }

      if (skills.length > 0) {
        const skillsElement = document.createElement("section");
        skillsElement.innerHTML = `
          <h2>Technical Skills</h2>
          <ul>${skills.map((item) => `<li>${item}</li>`).join("\n")}</ul>
        `;
        grid.appendChild(skillsElement);
      }

      if (knowsLanguage.length > 0) {
        const languagesElement = document.createElement("section");
        languagesElement.innerHTML = `
          <h2>Languages</h2>
          <ul>${knowsLanguage.map((item) => `<li>${item}</li>`).join("\n")}</ul>
        `;
        grid.appendChild(languagesElement);
      }

      if (certs.length > 0) {
        const certsElement = document.createElement("section");
        certsElement.innerHTML = `
          <h2>Certifications</h2>
          <ul>${certs.map((item) => `<li>${item.name}</li>`).join("\n")}</ul>
        `;
        grid.appendChild(certsElement);
      }

      section.appendChild(grid);
      this.main.appendChild(section);
    }

    renderWork() {
      const { worksFor } = this.person;

      if (0 === worksFor.length) {
        return;
      }

      const section = document.createElement("section");
      section.innerHTML = `
        <h2>Professional Experience</h2>
        ${worksFor.map(this.xp).join("\n")}
      `;

      this.main.appendChild(section);
    }

    renderEducation() {
      const { alumniOf } = this.person;

      if (0 === alumniOf.length) {
        return;
      }

      const section = document.createElement("section");
      section.innerHTML = `
        <h2>Education</h2>
        ${alumniOf.map(this.xp).join("\n")}
      `;

      this.main.appendChild(section);
    }

    renderProjects() {
      const { projects } = this.person;
      if (projects.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
        <h2>Projects</h2>
        ${projects.map(this.xp).join("\n")}
      `;

        this.main.appendChild(section);
      }
    }

    renderLifeEvents() {
      function lifeEvent(event) {
        return `
                <article>
                    ${event.name ? `<h3>${event.name}</h3>` : ""}
                    ${
                      event.startDate || (event.location && event.location.name)
                        ? `
                    <div class="caption">
                        ${event.startDate ? `${event.startDate}` : ""}
                        ${event.location && event.location.name ? `${event.location.name}` : ""}
                    </div>`
                        : ""
                    }
                    ${event.description ? `<p>${event.description}</p>` : ""}                
                </article>
            `;
      }
      const lifeEvents = this.person.lifeEvent;
      if (0 === lifeEvents.length) {
        return;
      }

      const section = document.createElement("section");
      section.innerHTML = `
        <h2>Life Events</h2>
        <div>
            ${lifeEvents.map(lifeEvent).join("\n")}
        </div>
      `;
      this.main.appendChild(section);
    }

    renderSocial() {
      const { sameAs, url, email, telephone } = this.person;
      const links = super.normalizeArray(
        sameAs,
        url,
        email ? `mailto:${email}` : undefined,
        telephone ? `tel:${telephone}` : undefined,
      );
      if (links.length > 0) {
        return `<ul">${links.map((link) => `<li><a href="${link}">${super.faIcon(link)}</a></li>`).join("\n")}</ul>`;
      }
    }

    renderFooter() {
      const section = document.createElement("footer");
      section.innerHTML = this.renderSocial();
      this.main.appendChild(section);
    }

    render() {
      this.renderHeader();
      this.renderBasics();
      this.renderProjects();
      this.renderWork();
      this.renderEducation();
      this.renderLifeEvents();
      this.renderFooter();
    }
  },
);
