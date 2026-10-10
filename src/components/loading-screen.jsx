import { motion, useReducedMotion } from 'motion/react';
import { CountUp } from './ui/CountUp';
import '../styles/loading-screen.css';

export function LoadingScreen({ leaving = false, onComplete }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`site-loader${leaving ? ' site-loader--leaving' : ''}`}
      role="status"
      aria-label="Loading Jeff's portfolio"
      aria-live="polite"
    >
      <motion.div
        className="site-loader__content"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="site-loader__brand" aria-hidden="true">
          JEFF.DEV
        </div>
        <div className="site-loader__name">Jeff A. Gentapanan</div>
        <div className="site-loader__status">Preparing the experience</div>
        <div className="site-loader__meter" aria-hidden="true">
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: reduceMotion ? 0.05 : 2.25,
              delay: 0.08,
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </div>
        <div className="site-loader__counter" aria-hidden="true">
          <CountUp
            from={0}
            to={100}
            duration={2.25}
            delay={0.08}
            separator=","
            className="site-loader__number"
            startWhen={!reduceMotion}
            onEnd={onComplete}
          />
          <span>%</span>
        </div>
      </motion.div>
      <div className="site-loader__footer" aria-hidden="true">
        <span>DESIGN &amp; DEVELOPMENT</span>
        <span>PORTFOLIO</span>
      </div>
    </div>
  );
}
