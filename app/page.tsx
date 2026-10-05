import { LabTerminal } from "../components/LabTerminal";
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
          <h2>Không học thuộc một lỗi.<br />Chẩn đoán nhiều cơ chế.</h2>
          <p>
            Lab hiện tại vẫn là simulator deterministic trong browser. Chuỗi thực hành bắt đầu bằng file permission,
            sau đó chuyển sang một incident OS/network khác cơ chế để buộc người học đối chiếu evidence thay vì replay một lệnh chmod.
          </p>
          <ol>
            <li>Đọc symptom, chưa vội sửa.</li>
            <li>Tách observation về resource và process/identity.</li>
            <li>Ghi hypothesis trước khi thay đổi fixture.</li>
            <li>Sửa tối thiểu, verify đúng endpoint rồi giải thích cơ chế.</li>
          </ol>
        </div>
        <LabTerminal />
      </section>

      <section className="principles" id="principles">
        <span className="kicker">LEARNING DESIGN</span>
        <h2>Kiến thức chỉ được tính là “biết” khi bạn xử lý được tình huống mới.</h2>
        <div className="principleGrid">
          <div><b>Explain</b><p>Giải thích bản chất, không bắt học thuộc command.</p></div>
          <div><b>Observe</b><p>Đọc symptom, resource, process và network trước khi thay đổi hệ thống.</p></div>
          <div><b>Repair</b><p>Mục tiêu: mỗi incident có evidence gate, repair tối thiểu và verification.</p></div>
          <div><b>Transfer</b><p>Chuỗi Linux hiện có permission transfer và một incident OS/network khác cơ chế để giảm memorization.</p></div>
        </div>
      </section>

      <footer>
        <strong>HOLI/DEVOPS</strong>
        <span>Build operators, not command memorizers.</span>
      </footer>
    </main>
  );
}
