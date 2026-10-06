import { LabTerminal } from "../components/LabTerminal";
import { CiLab } from "../components/CiLab";
import { curriculum } from "../lib/curriculum";

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top">HOLI<span>/DEVOPS</span></a>
        <nav>
          <a href="#path">Lộ trình</a>
          <a href="#lab">Lab</a>
          <a href="#principles">Cách học</a>
        </nav>
        <a className="navCta" href="#lab">Vào lab</a>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">DEVOPS FROM ZERO → PRODUCTION</div>
        <h1>Đừng chỉ <em>đọc</em> DevOps.<br />Hãy vận hành nó.</h1>
        <p className="heroCopy">
          Một lộ trình có thứ tự, bài học ngắn, incident thực hành và môi trường lab để bạn học cách
          suy luận như một DevOps/SRE engineer — từ Linux đến Kubernetes và production operations.
        </p>
        <div className="heroActions">
          <a className="primary" href="#path">Bắt đầu từ nền tảng</a>
          <a className="secondary" href="#lab">Thử incident lab</a>
        </div>
        <div className="truthBar">
          <div><b>01</b><span>Learn the model</span></div>
          <div><b>02</b><span>Break the system</span></div>
          <div><b>03</b><span>Diagnose with evidence</span></div>
          <div><b>04</b><span>Fix & verify</span></div>
        </div>
      </section>

      <section className="section" id="path">
        <div className="sectionHeading">
          <div>
            <span className="kicker">CURRICULUM V0 / ĐANG XÂY DỰNG</span>
            <h2>Một đường học. Không học lan man.</h2>
          </div>
          <p>Curriculum đầu tiên ưu tiên mental model và troubleshooting trước khi đẩy người học vào tool-chasing.</p>
        </div>
        <div className="moduleGrid">
          {curriculum.map((module, index) => (
            <article className="moduleCard" key={module.id}>
              <div className="moduleMeta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{module.level}</small>
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div className="chips">
                {module.skills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}
              </div>
              <div className="labLine"><b>LAB DỰ KIẾN</b>{module.lab}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="labSection" id="lab">
        <div className="labCopy">
          <span className="kicker">PRACTICAL LAB / MVP</span>
          <h2>Cùng symptom.<br />Khác nguyên nhân.</h2>
          <p>
            Lab hiện tại vẫn là simulator deterministic trong browser. Sau hai file-permission case,
            người học gặp hai health incident có cùng connection-refused symptom nhưng process/socket evidence dẫn tới nguyên nhân khác nhau.
          </p>
          <ol>
            <li>Đọc symptom, chưa vội sửa.</li>
            <li>Tách observation về resource, process và socket.</li>
            <li>Khóa hypothesis trước khi thấy repair syntax.</li>
            <li>Sửa tối thiểu, verify đúng endpoint rồi giải thích cơ chế.</li>
          </ol>
        </div>
        <LabTerminal />
      </section>

      <section className="section ciLearningSection" id="git-ci-lab">
        <div className="sectionHeading">
          <div>
            <span className="kicker">FOUNDATION VERTICAL SLICE</span>
            <h2>Git & CI: điều tra từ evidence.</h2>
          </div>
          <p>Ba incident SIMULATED: artifact delivery, release acceptance và delivery graph. Khóa diagnosis, sửa tối thiểu, kiểm tra output thực sự rồi giải thích và áp dụng vào tình huống mới.</p>
        </div>
        <CiLab />
      </section>

      <section className="principles" id="principles">
        <span className="kicker">LEARNING DESIGN</span>
        <h2>Kiến thức chỉ được tính là “biết” khi bạn phân biệt được các nguyên nhân cạnh tranh.</h2>
        <div className="principleGrid">
          <div><b>Explain</b><p>Giải thích bản chất, không bắt học thuộc command.</p></div>
          <div><b>Observe</b><p>Đọc symptom, resource, process và network trước khi thay đổi hệ thống.</p></div>
          <div><b>Repair</b><p>Mỗi incident có evidence gate, causal hypothesis, repair tối thiểu và verification.</p></div>
          <div><b>Transfer</b><p>Hai health case dùng cùng learner-facing prompt; chỉ evidence mới phân biệt process failure với socket mismatch.</p></div>
        </div>
      </section>

      <footer>
        <strong>HOLI/DEVOPS</strong>
        <span>Build operators, not command memorizers.</span>
      </footer>
    </main>
  );
}

