customElements.define(
  "semantic-cv-theme-holden-wreck",
  class extends SemanticCvTheme {
    constructor() {
      super();
      this.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css"  />
        <div class="wrapper">
            <header>
                <div>
                    <img />
                    <div>
                        <h1></h1>
                        <h2></h2>
                        <div class="description"></div>
                    </div>
                </div>
            </header>
            <main>
            </main>
        </div>
      `;
    }

    renderHeader() {
      const imgElement = this.querySelector("header img");
      const nameElement = this.querySelector("header h1");
      const jobTitleElement = this.querySelector("header h2");
      const descriptionElement = this.querySelector("header .description");

      const { image, name, description, jobTitle, email, telephone } =
        this.person;

      nameElement.innerHTML = name ?? "";
      jobTitleElement.innerHTML = jobTitle ?? "";

      if (image) {
        imgElement.setAttribute("src", image);
        imgElement.setAttribute("alt", name ?? "");
      } else {
        this.querySelector("header").removeChild(imgElement);
      }

      if (description) {
        descriptionElement.innerHTML = description;
      } else {
        this.querySelector("header > div > div").removeChild(
          descriptionElement,
        );
      }

      if (email || telephone) {
        const contact = document.createElement("ul");
        if (email) {
          const emailElement = document.createElement("li");
          emailElement.innerHTML = `<a href="mailto:${email}"><i class="fas fa-envelope"></i><span>${email}</span></a>`;
          contact.appendChild(emailElement);
        }
        if (telephone) {
          const phoneElement = document.createElement("li");
          phoneElement.innerHTML = `<a href="tel:${telephone}"><i class="fas fa-phone"></i><span>${telephone}</span></a>`;
          contact.appendChild(phoneElement);
        }
        descriptionElement.appendChild(contact);
      }
    }

    renderSummary() {
      const grid = document.createElement("div");
      grid.setAttribute("class", "grid");

      const {
        knowsAbout,
        skills,
        knowsLanguage,
        hasCertification,
        hasCredential,
      } = this.person;
      const certs = [...hasCertification, ...hasCredential];
      if (knowsAbout.length) {
        const knowsElement = document.createElement("div");
        knowsElement.innerHTML = `
            <h3>Core Competencies</h3>
            <ul>${knowsAbout.map((item) => `<li>${item}</li>`).join("")}</ul>
        `;
        grid.appendChild(knowsElement);
      }

      if (skills.length) {
        const skillsElement = document.createElement("div");
        skillsElement.innerHTML = `
            <h3>Tech Skills</h3>
            <ul>${skills.map((item) => `<li>${item}</li>`).join("")}</ul>
        `;
        grid.appendChild(skillsElement);
      }

      if (knowsLanguage.length) {
        const languagesElement = document.createElement("div");
        languagesElement.innerHTML = `
            <h3>Languages</h3>
            <ul>${knowsLanguage.map((item) => `<li>${item}</li>`).join("")}</ul>
        `;
        grid.appendChild(languagesElement);
      }

      if (certs.length) {
        const certsElement = document.createElement("div");
        certsElement.innerHTML = `
            <h3>Certifications</h3>
            <ul>${certs.map((item) => `<li>${item.name}</li>`).join("")}</ul>
        `;
        grid.appendChild(certsElement);
      }

      const section = document.createElement("section");
      section.innerHTML = `<h2>Professional Summary</h2>`;
      section.appendChild(grid);

      return section;
    }

    experience(xp) {
      const { startDate, endDate, roleName, description, worksFor, alumniOf } =
        xp;
      const { name, location } = worksFor || alumniOf;
      const period =
        startDate || endDate
          ? `
            ${startDate ? `<time datetime="${startDate}">${startDate}</time>` : ""}
            ${endDate ? ` <time datetime="${endDate}">${endDate}</time>` : "present"}
          `
          : undefined;

      const article = document.createElement("article");
      article.innerHTML = `
        <h3>${name ?? ""}</h3>
        <ul class="caption">
        ${roleName ? `<li>${roleName}</li>` : ""}
        ${period ? `<li>${period}</li>` : ""}
        ${location ? `<li>${location}</li>` : ""}
        </ul>
        <p>${description ?? ""}</p>
      `;
      return article;
    }

    renderWork() {
      const { worksFor } = this.person;
      if (worksFor.length) {
        const section = document.createElement("section");
        section.innerHTML = `<h2>Professional Experience</h2>`;
        for (const organization of worksFor) {
          section.appendChild(this.experience(organization));
        }
        return section;
      }
    }

    renderEducation() {
      const { alumniOf } = this.person;
      if (alumniOf.length) {
        const section = document.createElement("section");
        section.innerHTML = `<h2>Education</h2>`;
        for (const organization of alumniOf) {
          section.appendChild(this.experience(organization));
        }
        return section;
      }
    }

    renderProjects() {
      const { projects } = this.person;
      if (projects.length) {
        const section = document.createElement("section");
        section.innerHTML = `<h2>Projects</h2>`;
        for (const xp of projects) {
          section.appendChild(this.experience(xp));
        }
      }
    }

    renderLifeEvents() {
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
        section.innerHTML = `
            <h2>Life Events</h2>
            ${lifeEvents.map(lifeEvent).join("")}
        `;
        return section;
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
      this.renderHeader();
      this.renderMain([
        this.renderSummary(),
        this.renderProjects(),
        this.renderWork(),
        this.renderEducation(),
        this.renderLifeEvents(),
      ]);
    }
  },
);
