customElements.define(
  "semantic-cv-theme-typewriter",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet" />
        <main><article class="paper"></article></main>
      `;
      this.container = this.querySelector("main > article");
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
      const { name, jobTitle } = this.person;
      const header = document.createElement("header");
      header.innerHTML = `
        <h1>${name ?? ""}</h1>
        <div>${jobTitle ?? ""}</div>
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
      if (description) {
        const grid = document.createElement("section");
        grid.setAttribute("id", "basics");

        const desc = document.createElement("div");
        desc.innerHTML = `
          <h2>Professional Summary</h2>
          <p>${description}</p>
        `;
        grid.appendChild(desc);

        if (knowsAbout.length > 0) {
          const knowsAboutElement = document.createElement("div");
          knowsAboutElement.innerHTML = `
            <h2>Expertise</h2>
            <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("\n")}</ul>
          `;
          grid.appendChild(knowsAboutElement);
        }

        if (skills.length > 0) {
          const skillsElement = document.createElement("div");
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
    }

    renderWork() {
      const { worksFor } = this.person;
      if (worksFor.length) {
        const section = document.createElement("section");
        section.innerHTML = `
        <h2>Professional Experience</h2>
        <div>
        ${worksFor.map(this.xp).join("\n")}
        </div>  
      `;
        this.container.appendChild(section);
      }
    }

    renderEducation() {
      const { alumniOf } = this.person;
      if (alumniOf.length) {
        const section = document.createElement("section");
        section.innerHTML = `
        <h2>Education</h2>
        <div>
        ${alumniOf.map(this.xp).join("\n")}
        </div>  
      `;
        this.container.appendChild(section);
      }
    }

    renderProjects() {
      const { projects } = this.person;
      if (projects.length) {
        const section = document.createElement("section");
        section.innerHTML = `
        <h2>Projects</h2>
        <div>
        ${projects.map(this.xp).join("\n")}
        </div>  
      `;
        this.container.appendChild(section);
      }
    }

    renderLifeEvents() {
      function lifeEvent(event) {
        return `
            <div>
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
            </div>
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
