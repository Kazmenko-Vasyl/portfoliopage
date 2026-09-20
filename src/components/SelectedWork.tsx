import "./SelectedWork.css";
import { PROJECTS, type Project } from "../data/site";
import { Reveal } from "./Reveal";

export function SelectedWork() {
  return (
    <section id="work" className="selected-work">
      <div className="selected-work__head">
        <h2 className="selected-work__title">
          SELECTED
          <br />
          WORK
        </h2>
        <p className="selected-work__eyebrow">02 / three businesses online</p>
      </div>

      {PROJECTS.map((project, i) => {
        const imageFirst = i % 2 === 1;
        return (
          <Reveal
            as="a"
            key={project.url}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={"selected-work__row" + (imageFirst ? " selected-work__row--reverse" : "")}
          >
            {imageFirst && <ProjectShot project={project} />}
            <div>
              <p className="selected-work__index">{project.index}</p>
              <h3 className="selected-work__project-title">{project.title}</h3>
              <p className="selected-work__description">{project.description}</p>
              <div className="selected-work__tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="selected-work__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {!imageFirst && <ProjectShot project={project} />}
          </Reveal>
        );
      })}
    </section>
  );
}

function ProjectShot({ project }: { project: Project }) {
  const host = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <div className={"selected-work__shot" + (project.shot ? " selected-work__shot--image" : "")}>
      {project.shot && (
        <img
          className="selected-work__shot-img"
          src={project.shot}
          alt={`${project.title} — site screenshot`}
          loading="lazy"
          decoding="async"
          width={1600}
          height={1000}
        />
      )}
      <span className="selected-work__shot-label">visit {host} ↗</span>
    </div>
  );
}
