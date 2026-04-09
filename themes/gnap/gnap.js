customElements.define(
  "semantic-cv-theme-gnap",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap" />
        <main class="grey darken-4 white-text">
            <article class="white black-text">
                <header class="valign-wrapper grey darken-4 white-text">
                    <div class="container">
                    </div>
                </header>
                <section id="basics">
                    <div class="container">
                    </div>
                </section>
                <section id="projects">
                    <div class="container">
                    </div>
                </section>
                <section id="work">
                    <div class="container">
                    </div>
                </section>
                <section id="education">
                    <div class="container">
                    </div>
                </section>
                <section id="certificates">
                    <div class="container">
                    </div>
                </section>
                <section id="events">
                    <div class="container">
                    </div>
                </section>                    
            </article>
            <footer class="grey darken-4 white-text">
                <div class="container">
                </div>
            </footer>
            <div class="menu" role="navigation" aria-label="primary">
            </div>
        </main>
      `;
    }

    renderHeader() {
      const { name, jobTitle, telephone } = this.person;
      const header = this.querySelector("main article header .container");
      header.innerHTML = `
        <div class="no-print">Hi, I'm</div>
        <h1>${name ?? ""}</h1>
        ${jobTitle ? `<h4 class="job-title" id="job-title">${jobTitle}</h4>` : ""}
        ${telephone ? `<div class="print"><i class="fas fa-phone"></i> ${telephone}</div>` : ""}
      `;
    }

    renderBasics() {
      const { knowsLanguage, knowsAbout, skills, description } = this.person;
      function renderSummary() {
        if (description) {
          return `
            <div id="summary">
                <h2>Profile</h2>
                ${description ? `<div>${description}</div>` : ""}
            </div>
        `;
        }
      }
      function renderSkills() {
        return `
        <div id="skills">
            <h2>Skills & Expertise</h2>
            <div>
              ${
                0 === knowsAbout.length
                  ? ""
                  : `
                  <div>
                    <h3>Core</h3>
                    <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("\n")}</ul>
                  </div>`
              }
              ${
                0 === skills.length
                  ? ""
                  : `
                  <div>
                    <h3>Tech</h3>
                    <ul>${skills.map((item) => `<li>${item}</li>`).join("\n")}</ul>
                  </div>`
              }
            </div>
        </div>
`;
      }

      function renderLanguages() {
        if (knowsLanguage.length > 0) {
          return `
            <div id="languages">
                <h2>Languages</h2>
                <ul class="languages">
                    ${knowsLanguage
                      .map(
                        (language) => `<li>
                        ${language}
                    </li>`,
                      )
                      .join("\n")}
                </ul>
            </div>    
            `;
        }
      }

      this.querySelector("#basics .container").innerHTML = `
        ${renderSummary() ?? ""}
        ${renderSkills() ?? ""}
        ${renderLanguages() ?? ""}
      `;
    }

    renderWork() {
      function experience(xp) {
        const { roleName, startDate, endDate, description, worksFor } = xp;
        const { name } = worksFor;
        const period = () => {
          if (startDate || endDate) {
            return `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
           `;
          }
        };
        return `
            <h4>${name}</h4>
            <div class="caption">
                ${roleName ? `<span>${roleName}</span>` : ""}
                ${period() ?? ""}
            </div>
            ${description ? `<ul><li>${description}</li></ul>` : ""}
          `;
      }
      const { worksFor } = this.person;
      if (worksFor.length > 0) {
        this.querySelector("#work .container").innerHTML = `
          <h2>Work Experience</h2>
          <ul>${worksFor
            .map((item) => {
              const xp = experience(item);
              return xp ? `<li>${xp}</li>` : "";
            })
            .join("\n")}</ul>
        `;
      }
    }

    renderEducation() {
      function period(xp) {
        const { startDate, endDate } = xp;
        if (startDate || endDate) {
          return `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
        `;
        }
      }
      function caption(xp) {
        const { description } = xp;
        return `
            <div class="caption">
                ${description ?? ""}
                ${period(xp) ?? ""}
            </div>
        `;
      }
      function school(xp) {
        const { alumniOf } = xp;
        const { name } = alumniOf;
        return `
            <h4>${name}</h4>
            ${caption(xp) ?? ""}
        `;
      }

      const { alumniOf } = this.person;
      if (alumniOf.length > 0) {
        this.querySelector("#education .container").innerHTML = `
            <h2>Education</h2>
            <ul>${alumniOf
              .map((item) => {
                const xp = school(item);
                return xp ? `<li>${xp}</li>` : "";
              })
              .join("\n")}
            </ul>
        `;
      }
    }

    renderProjects() {
      const project = (xp) => {
        const { worksFor } = xp;
        const { name } = worksFor ?? {};
        return name;
      };
      const { projects } = this.person;
      if (projects.length > 0) {
        this.querySelector("#projects .container").innerHTML = `
            <h2>Featured Projects</h2>
            <ul>${projects
              .map((item) => {
                const xp = project(item);
                return xp ? `<li>${xp}</li>` : "";
              })
              .join("\n")}
            </ul>
        `;
      }
    }

    renderCertificates() {
      const certs = [
        ...this.person.hasCertification,
        ...this.person.hasCredential,
      ];
      if (certs.length > 0) {
        this.querySelector("#certificates .container").innerHTML = `
            <h2>Certificates</h2>
            <ul>${certs
              .map(
                (cert) => `
                <li>
                    <h4>${cert.name}</h4>
                </li>`,
              )
              .join("\n")}
            </ul>
        `;
      }
    }

    renderLifeEvents() {
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
        const container = this.querySelector("#events .container");
        container.innerHTML = `
            <h2>Life Events</h2>
            <ul>${lifeEvents.map(lifeEvent).join("\n")}</ul>
        `;
      }
    }

    social() {
      const { sameAs, url, email, telephone } = this.person;
      let links = [...sameAs];
      if (url) {
        links.push(url);
      }
      if (email) {
        links.push(`mailto:${email}`);
      }
      if (telephone) {
        links.push(`tel:${telephone}`);
      }
      if (links.length > 0) {
        return `<ul class="social">${links.map((url) => `<li><a href="${url}">${super.faIcon(url)}</a></li>`).join("\n")}</ul>`;
      }
    }

    renderFooter() {
      const { lifeEvent } = this.person;
      this.querySelector("footer .container").innerHTML = `
        <ul class="row center inline inline-delimited">
            <li><a href="#basics">Top of page</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#work">Work Experience</a></li>
            ${lifeEvent ? `<li><a href="#events">Life events</a></li>` : ""}
        </ul>
        <div class="row center">
          Thanks for visiting!
          ${this.social() ?? ""}
        </div>
      `;
    }

    renderMenu() {
      this.querySelector(".menu").innerHTML =
        `<div>${this.social() ?? ""}</div>`;
    }

    render(cv) {
      this.renderHeader();
      this.renderBasics();
      this.renderProjects();
      this.renderWork();
      this.renderEducation();
      this.renderCertificates();
      this.renderLifeEvents();
      this.renderFooter();
      this.renderMenu();
    }
  },
);
