customElements.define(
  "semantic-cv-theme-times",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Pirata+One&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <main><div></div></main>
      `;
      this.container = this.querySelector("main > div");
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

    renderSocial() {
      const { sameAs, url, email, telephone } = this.person;
      const links = super.normalizeArray(
        sameAs,
        url,
        email ? `mailto:${email}` : undefined,
        telephone ? `tel:${telephone}` : undefined,
      );
      if (links.length > 0) {
        return `<ul class="social">${links.map((item) => `<li><a href="${item}">${super.faIcon(item)}</a></li>`).join("\n")}</ul>`;
      }
    }

    renderHeader() {
      const header = document.createElement("header");
      const now = new Date();
      const { name, jobTitle } = this.person;
      header.innerHTML = `
        <h1>
            ${name ?? ""}
            <small>${jobTitle ?? ""}</small>
        </h1>
        <div class="grid">
            <div>${now.toLocaleDateString()}</div>
            <div>${this.renderSocial() ?? ""}</div>
        </div>
        <div class="hr"></div>
      `;
      this.container.appendChild(header);
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
      const certs = [...hasCertification, ...hasCredential];
      const desc = document.createElement("section");
      desc.innerHTML = `
          <h2 class="pirata-one-regular">Professional Summary</h2>
          ${description ? `<p>${description}</p>` : ""}
        `;
      this.container.appendChild(desc);

      const grid = document.createElement("section");
      grid.setAttribute("id", "basics");

      if (knowsAbout.length > 0) {
        const knowsAboutElement = document.createElement("article");
        knowsAboutElement.innerHTML = `
            <h2>Expertise</h2>
            <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("\n")}</ul>
          `;
        grid.appendChild(knowsAboutElement);
      }

      if (skills.length > 0) {
        const skillsElement = document.createElement("article");
        skillsElement.innerHTML = `
            <h2>Skills</h2>
            <ul>${skills.map((item) => `<li>${item}</li>`).join("\n")}</ul>
            `;
        grid.appendChild(skillsElement);
      }

      if (knowsLanguage.length > 0) {
        const languagesElement = document.createElement("article");
        languagesElement.innerHTML = `
            <h2>Languages</h2>
            <ul>${knowsLanguage.map((item) => `<li>${item}</li>`).join("\n")}</ul>
          `;
        grid.appendChild(languagesElement);
      }

      if (certs.length > 0) {
        const certsElement = document.createElement("article");
        certsElement.innerHTML = `
            <h2>Certifications</h2>
            <ul>${certs.map((item) => `<li>${item.name}</li>`).join("\n")}</ul>
          `;
        grid.appendChild(certsElement);
      }

      this.container.appendChild(grid);
    }

    renderWork() {
      const section = document.createElement("section");
      const { worksFor } = this.person;
      section.innerHTML = `
        <h2 class="pirata-one-regular">Professional Experience</h2>
        <div id="work">
        ${worksFor.map(this.xp).join("\n")}
        </div>  
      `;
      this.container.appendChild(section);
    }

    renderEducation() {
      const section = document.createElement("section");
      const { alumniOf } = this.person;
      section.innerHTML = `
        <h2 class="pirata-one-regular">Education</h2>
        <div id="education">
        ${alumniOf.map(this.xp).join("\n")}
        </div>  
      `;
      this.container.appendChild(section);
    }

    renderProjects() {
      const { projects } = this.person;
      if (projects.length) {
        const section = document.createElement("section");
        section.innerHTML = `
        <h2 class="pirata-one-regular">Projects</h2>
        <div id="projects">
        ${projects.map(this.xp).join("\n")}
        </div>  
      `;
        this.container.appendChild(section);
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
      if (lifeEvents.length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `
            <h2 class="pirata-one-regular">Life Events</h2>
            <div id="events">
                ${lifeEvents.map(lifeEvent).join("\n")}
            </div>
        `;
        this.container.appendChild(section);
      }
    }

    render() {
      this.renderHeader();
      this.renderBasics();
      this.renderProjects();
      this.renderWork();
      this.renderEducation();
      this.renderLifeEvents();
    }
  },
);
