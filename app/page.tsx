import { LabTerminal } from "../components/LabTerminal";
import { CiLab } from "../components/CiLab";
import { GitFoundationsLesson } from "../components/GitFoundationsLesson";
import { curriculum } from "../lib/curriculum";

const operatingLoop = [
  ["01", "Observe", "Thu evidence trước khi kết luận."],
  ["02", "Hypothesize", "Khóa causal class trước repair."],
  ["03", "Repair", "Thay đổi tối thiểu, có chủ đích."],
  ["04", "Verify", "Chứng minh outcome và cơ chế."]
] as const;

const productSignals = [
  ["07", "incident mô phỏng", "Linux + Git/CI"],
  ["02", "causal transfer", "khác failure shape"],
  ["12", "browser regression", "production Chromium"],
  ["01", "trust boundary", "learner input không chạy host"]
] as const;

export default function Home() {
  return (
    <main className="siteShell">
      <a className="skipLink" href="#path">Bỏ qua điều hướng</a>

      <header className="nav">
        <div className="navInner">
          <a className="brand" href="#top" aria-label="Holi DevOps home">
            <span className="brandMark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="brandWord">HOLI</span>
            <span className="brandSlash">/DEVOPS</span>
          </a>

          <nav aria-label="Điều hướng chính">
            <a href="#path">Lộ trình</a>
            <a href="#lab">Lab</a>
            <a href="#git-foundations">Git nền tảng</a>
            <a href="#principles">Cách học</a>
          </nav>

          <a className="navCta" href="#lab">
            <span className="statusDot" aria-hidden="true" />
            Vào lab
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="heroBackdrop" aria-hidden="true">
          <div className="gridPlane" />
          <div className="heroOrb heroOrbA" />
          <div className="heroOrb heroOrbB" />
        </div>

        <div className="heroGrid">
          <div className="heroMain">
            <div className="eyebrow">
              <span className="eyebrowPulse" aria-hidden="true" />
              DEVOPS FROM ZERO → PRODUCTION
            </div>
            <h1>
              Đừng chỉ <em>đọc</em> DevOps.
              <br />
              Hãy vận hành nó.
            </h1>
            <p className="heroCopy">
              Một lộ trình có thứ tự, bài học ngắn, incident thực hành và môi trường lab để bạn học cách
              suy luận như một DevOps/SRE engineer — từ Linux đến Kubernetes và production operations.
            </p>
            <div className="heroActions">
              <a className="primary" href="#path">
                <span>Bắt đầu từ nền tảng</span>
                <b aria-hidden="true">↗</b>
              </a>
              <a className="secondary" href="#lab">
                <span>Thử incident lab</span>
                <b aria-hidden="true">→</b>
              </a>
            </div>

            <div className="heroProof">
              <span className="proofLabel">CURRENT PRODUCT TRUTH</span>
              <span>SIMULATED browser labs</span>
              <span>evidence-first reasoning</span>
              <span>local checkpoint, không phải mastery</span>
            </div>
          </div>

          <aside className="heroConsole" aria-label="Tổng quan Holi DevOps">
            <div className="consoleChrome">
              <div className="consoleDots" aria-hidden="true"><i /><i /><i /></div>
              <span>holi://learning-runtime</span>
              <span className="consoleLive"><i /> PUBLIC</span>
            </div>

            <div className="consoleBody">
              <div className="runtimeHeader">
                <div>
                  <span className="microLabel">LEARNING RUNTIME</span>
                  <strong>Evidence-driven operator training</strong>
                </div>
                <div className="runtimeBadge">SIMULATED</div>
              </div>

              <div className="signalGrid">
                {productSignals.map(([value, label, detail]) => (
                  <div className="signalCard" key={label}>
                    <b>{value}</b>
                    <span>{label}</span>
                    <small>{detail}</small>
                  </div>
                ))}
              </div>

              <div className="runtimeTrace" aria-hidden="true">
                <div className="traceRail">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="traceRows">
                  <p><b>observe</b><span>symptom → resource → identity</span></p>
                  <p><b>reason</b><span>evidence → hypothesis → mechanism</span></p>
                  <p><b>operate</b><span>minimal repair → verify → transfer</span></p>
                </div>
              </div>

              <div className="runtimeFooter">
                <span>PUBLIC WEB SHELL</span>
                <code>holi.shao.dpdns.org</code>
              </div>
            </div>
          </aside>
        </div>

        <div className="truthBar" aria-label="Holi learning loop">
          {operatingLoop.map(([number, title, copy]) => (
            <div key={number}>
              <b>{number}</b>
              <span><strong>{title}</strong><small>{copy}</small></span>
            </div>
          ))}
        </div>
      </section>

      <section className="section curriculumSection" id="path">
        <div className="sectionHeading">
          <div>
            <span className="kicker">CURRICULUM V0 / ĐANG XÂY DỰNG</span>
            <h2>Một đường học.<br />Không học lan man.</h2>
          </div>
          <div className="sectionAside">
            <span className="sectionIndex">01 / PATH</span>
            <p>Curriculum đầu tiên ưu tiên mental model và troubleshooting trước khi đẩy người học vào tool-chasing.</p>
          </div>
        </div>

        <div className="moduleGrid">
          {curriculum.map((module, index) => (
            <article className="moduleCard" key={module.id}>
              <div className="moduleTopline">
                <div className="moduleIndex">{String(index + 1).padStart(2, "0")}</div>
                <span className={"levelPill level" + module.level}>{module.level}</span>
              </div>
              <div className="moduleGlyph" aria-hidden="true">
                <span>{index < 2 ? "FOUND" : index < 4 ? "CORE" : "PROD"}</span>
                <i />
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div className="chips">
                {module.skills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}
              </div>
              <div className="labLine"><b>LAB DỰ KIẾN</b><span>{module.lab}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="labSection" id="lab">
        <div className="labCopy">
          <div className="stickyCopy">
            <span className="kicker">PRACTICAL LAB / MVP</span>
            <h2>Cùng symptom.<br />Khác nguyên nhân.</h2>
            <p>
              Lab hiện tại vẫn là simulator deterministic trong browser. Sau hai file-permission case,
              người học gặp hai health incident có cùng connection-refused symptom nhưng process/socket evidence dẫn tới nguyên nhân khác nhau.
            </p>

            <div className="labFlow">
              <div><b>01</b><span>Đọc symptom, chưa vội sửa.</span></div>
              <div><b>02</b><span>Tách observation về resource, process và socket.</span></div>
              <div><b>03</b><span>Khóa hypothesis trước khi thấy repair syntax.</span></div>
              <div><b>04</b><span>Sửa tối thiểu, verify đúng endpoint rồi giải thích cơ chế.</span></div>
            </div>

            <div className="trustCallout">
              <span className="statusDot" aria-hidden="true" />
              <div>
                <strong>SAFE PRACTICE BOUNDARY</strong>
                <p>Learner input chỉ đi qua deterministic simulator; không chạy shell/network thật trên host.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="labSurface">
          <div className="surfaceLabel">
            <span>INTERACTIVE INCIDENT WORKSPACE</span>
            <code>browser-state://local</code>
          </div>
          <LabTerminal />
        </div>
      </section>

      <GitFoundationsLesson />

      <section className="section ciLearningSection" id="git-ci-lab">
        <div className="sectionHeading">
          <div>
            <span className="kicker">FOUNDATION VERTICAL SLICE</span>
            <h2>Git & CI:<br />điều tra từ evidence.</h2>
          </div>
          <div className="sectionAside">
            <span className="sectionIndex">03 / DELIVERY</span>
            <p>Ba incident SIMULATED: artifact delivery, release acceptance và delivery graph. Khóa diagnosis, sửa tối thiểu, kiểm tra output thực sự rồi giải thích và áp dụng vào tình huống mới.</p>
          </div>
        </div>
        <CiLab />
      </section>

      <section className="principles" id="principles">
        <div className="principlesHeader">
          <span className="kicker">LEARNING DESIGN</span>
          <span className="sectionIndex">04 / METHOD</span>
        </div>
        <h2>Kiến thức chỉ được tính là “biết” khi bạn phân biệt được các nguyên nhân cạnh tranh.</h2>

        <div className="principleGrid">
          <div>
            <span>01</span>
            <b>Explain</b>
            <p>Giải thích bản chất, không bắt học thuộc command.</p>
          </div>
          <div>
            <span>02</span>
            <b>Observe</b>
            <p>Đọc symptom, resource, process và network trước khi thay đổi hệ thống.</p>
          </div>
          <div>
            <span>03</span>
            <b>Repair</b>
            <p>Mỗi incident có evidence gate, causal hypothesis, repair tối thiểu và verification.</p>
          </div>
          <div>
            <span>04</span>
            <b>Transfer</b>
            <p>Hai health case dùng cùng learner-facing prompt; chỉ evidence mới phân biệt process failure với socket mismatch.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="footerBrand">
          <strong>HOLI/DEVOPS</strong>
          <span>Build operators, not command memorizers.</span>
        </div>
        <div className="footerMeta">
          <span>SIMULATED LEARNING ENVIRONMENT</span>
          <span>© 2026 HOLI</span>
        </div>
      </footer>
    </main>
  );
}
