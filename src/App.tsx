import { motion, useScroll, useTransform } from 'framer-motion';
import { SceneManager } from './components/SceneManager';
import { ScrollController } from './components/ScrollController';
import { GlassPanel } from './components/GlassPanel';
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference';

const capabilities = [
  { title: 'API Gateway', detail: 'Contract-first APIs, edge policies, identity propagation.' },
  { title: 'Event Mesh', detail: 'Async flows, fan-out, replayable streams, dead letter routing.' },
  { title: 'Retry Loop', detail: 'Backoff, idempotency, compensation and failure containment.' },
  { title: 'Observability', detail: 'Trace context, service signals, business-level telemetry.' }
];

const projects = [
  'Integration blueprinting',
  'MuleSoft delivery systems',
  'Automation and data extraction',
  'Operational dashboards'
];

function App() {
  const prefersReducedMotion = useReducedMotionPreference();
  const { scrollYProgress } = useScroll();
  const headlineY = useTransform(scrollYProgress, [0, 0.35], [0, -120]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0.35]);

  return (
    <ScrollController disabled={prefersReducedMotion}>
      <main className="app-shell">
        <SceneManager reducedMotion={prefersReducedMotion} scrollProgress={scrollYProgress} />

        <header className="site-header" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Lucas Guaru home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Lucas Guaru</span>
          </a>
          <nav>
            <a href="#systems">Systems</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <section className="hero-section" id="top">
          <motion.div className="hero-copy" style={{ y: headlineY, opacity: headlineOpacity }}>
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 36 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              Integration Architecture
            </motion.h1>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              APIs, queues, events, retries and observability shaped into resilient systems.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32 }}
            >
              <a className="button primary" href="#systems">Explore Systems</a>
              <a className="button secondary" href="#work">View Work</a>
            </motion.div>
          </motion.div>

          <GlassPanel className="system-map-panel">
            <div className="panel-heading">
              <span>Live System Map</span>
              <span className="status-dot" aria-hidden="true" />
            </div>
            <div className="signal-list">
              {capabilities.map((item) => (
                <div className="signal-row" key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="content-section" id="systems">
          <div className="section-layout">
            <div>
              <h2>Systems That Stay Legible Under Pressure</h2>
              <p>
                The city is a metaphor for architecture work: request corridors, event avenues,
                retry towers and observability lights are designed as one operating surface.
              </p>
            </div>
            <div className="metric-grid" aria-label="System capabilities">
              {capabilities.map((item, index) => (
                <GlassPanel className="metric-card" key={item.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </GlassPanel>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section work-section" id="work">
          <div className="work-rail">
            <h2>Delivery Focus</h2>
            <div className="work-list">
              {projects.map((project) => (
                <motion.article
                  className="work-item"
                  key={project}
                  whileHover={prefersReducedMotion ? undefined : { x: 10 }}
                >
                  <span>{project}</span>
                  <small>Architecture, implementation, verification</small>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <GlassPanel className="contact-panel">
            <h2>Design the paths before traffic arrives.</h2>
            <p>
              Portfolio for resilient integration systems, automation, and operational clarity.
            </p>
            <a className="button primary" href="mailto:lucasguaru@gmail.com">Start a Conversation</a>
          </GlassPanel>
        </section>
      </main>
    </ScrollController>
  );
}

export default App;
