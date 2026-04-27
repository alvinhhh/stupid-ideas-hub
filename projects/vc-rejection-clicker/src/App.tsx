import { useEffect, useMemo, useState } from 'react';
import {
  buildRejectionEvent,
  buildRejectionStream,
  getUpgradeCost,
  getUnlockedFlavors,
  type RejectionEvent,
  type UpgradeId,
  UPGRADE_DEFS,
} from './rejection';

const STARTING_LOG = [
  buildRejectionEvent({
    idSeed: 1,
    source: 'system',
    amount: 1,
    flavor: 'soft pass',
    total: 0,
  }),
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRate(value: number) {
  return value.toFixed(value >= 10 ? 0 : 1);
}

export default function App() {
  const [bankedRejections, setBankedRejections] = useState(0);
  const [lifetimeRejections, setLifetimeRejections] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [passiveBuffer, setPassiveBuffer] = useState(0);
  const [upgradeLevels, setUpgradeLevels] = useState<Record<UpgradeId, number>>({
    warmIntro: 0,
    pitchDeckV2: 0,
    advisorCc: 0,
    dataRoom: 0,
    boardMeeting: 0,
  });
  const [activityLog, setActivityLog] = useState<RejectionEvent[]>(STARTING_LOG);

  const unlockedFlavors = useMemo(() => getUnlockedFlavors(upgradeLevels), [upgradeLevels]);

  const stats = useMemo(() => {
    const levels = upgradeLevels;
    const clickPower =
      1 +
      levels.warmIntro * 1 +
      levels.pitchDeckV2 * 2 +
      levels.advisorCc * 1 +
      levels.dataRoom * 2 +
      levels.boardMeeting * 3;

    const passiveRate =
      levels.warmIntro * 0.2 +
      levels.pitchDeckV2 * 0.8 +
      levels.advisorCc * 1.9 +
      levels.dataRoom * 3.2 +
      levels.boardMeeting * 4.5;

    const stressIndex = Math.min(100, Math.round(12 + clickPower * 6 + passiveRate * 5 + unlockedFlavors.length * 3));

    return {
      clickPower,
      passiveRate,
      stressIndex,
    };
  }, [unlockedFlavors.length, upgradeLevels]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPassiveBuffer((buffer) => {
        const nextBuffer = buffer + stats.passiveRate;
        const wholeRejections = Math.floor(nextBuffer);

        if (wholeRejections > 0) {
          setBankedRejections((value) => value + wholeRejections);
          setLifetimeRejections((value) => value + wholeRejections);
          setActivityLog((log) => [
            ...buildRejectionStream({
              count: wholeRejections,
              source: 'passive',
              flavors: unlockedFlavors,
              total: lifetimeRejections,
            }),
            ...log,
          ].slice(0, 8));
        }

        return nextBuffer - wholeRejections;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [lifetimeRejections, stats.passiveRate, unlockedFlavors]);

  const handleClick = () => {
    const amount = stats.clickPower;
    setTotalClicks((value) => value + 1);
    setBankedRejections((value) => value + amount);
    setLifetimeRejections((value) => value + amount);
    setActivityLog((log) => [
      buildRejectionEvent({
        idSeed: totalClicks + 101,
        source: 'click',
        amount,
        flavor: unlockedFlavors[totalClicks % unlockedFlavors.length],
        total: lifetimeRejections,
      }),
      ...log,
    ].slice(0, 8));
  };

  const buyUpgrade = (upgradeId: UpgradeId) => {
    const definition = UPGRADE_DEFS.find((item) => item.id === upgradeId);
    if (!definition) {
      return;
    }

    const nextLevel = upgradeLevels[upgradeId] + 1;
    const cost = getUpgradeCost(definition, upgradeLevels[upgradeId]);

    if (bankedRejections < cost) {
      return;
    }

    setBankedRejections((value) => value - cost);
    setUpgradeLevels((levels) => ({
      ...levels,
      [upgradeId]: nextLevel,
    }));
    setActivityLog((log) => [
      buildRejectionEvent({
        idSeed: cost + nextLevel,
        source: 'upgrade',
        amount: cost,
        flavor: unlockedFlavors[(nextLevel + cost) % unlockedFlavors.length],
        total: lifetimeRejections,
        title: 'Upgrade purchased',
      }),
      ...log,
    ].slice(0, 8));
  };

  const resetGame = () => {
    setBankedRejections(0);
    setLifetimeRejections(0);
    setTotalClicks(0);
    setPassiveBuffer(0);
    setUpgradeLevels({
      warmIntro: 0,
      pitchDeckV2: 0,
      advisorCc: 0,
      dataRoom: 0,
      boardMeeting: 0,
    });
    setActivityLog(STARTING_LOG);
  };

  const unlockedLabels = unlockedFlavors.map((flavor) => flavor.replace(/\b\w/g, (letter) => letter.toUpperCase()));

  return (
    <main className='app-shell'>
      <section className='topbar card dashboard-card'>
        <div>
          <p className='eyebrow'>vc rejection clicker</p>
          <h1>Build a pipeline of polite no's.</h1>
          <p className='lede'>Click to generate rejections. Buy upgrades to speed up the pace and unlock harsher response types.</p>
        </div>
        <div className='topbar-actions'>
          <button type='button' onClick={resetGame}>Reset pipeline</button>
        </div>
      </section>

      <section className='stats-grid'>
        <article className='card stat-card stress-card'>
          <span>Total rejections</span>
          <strong>{formatNumber(lifetimeRejections)}</strong>
          <p>Every click and passive tick adds to the pile.</p>
        </article>
        <article className='card stat-card'>
          <span>Banked rejections</span>
          <strong>{formatNumber(bankedRejections)}</strong>
          <p>Spend these on upgrades that increase the rejection rate.</p>
        </article>
        <article className='card stat-card'>
          <span>Rejections per click</span>
          <strong>{formatRate(stats.clickPower)}</strong>
          <p>Warm intros, deck polish, and follow ups all add up.</p>
        </article>
        <article className='card stat-card'>
          <span>Rejections per second</span>
          <strong>{formatRate(stats.passiveRate)}</strong>
          <p>Automated follow up keeps the decline machine moving.</p>
        </article>
      </section>

      <section className='primary-grid'>
        <section className='card control-panel dashboard-card'>
          <div className='section-head'>
            <div>
              <p className='eyebrow'>core loop</p>
              <h2>Generate rejections</h2>
            </div>
            <div className='stress-pill'>Stress {stats.stressIndex}%</div>
          </div>

          <button type='button' className='big-action' onClick={handleClick}>
            Send to partner
          </button>

          <div className='mini-metrics'>
            <div>
              <span>Clicks</span>
              <strong>{formatNumber(totalClicks)}</strong>
            </div>
            <div>
              <span>Unlocked types</span>
              <strong>{unlockedFlavors.length}</strong>
            </div>
          </div>

          <div className='unlock-strip'>
            {unlockedLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </section>

        <section className='card upgrade-panel dashboard-card'>
          <div className='section-head'>
            <div>
              <p className='eyebrow'>upgrades</p>
              <h2>Rejection engine</h2>
            </div>
            <p className='meta'>Costs rise with each level.</p>
          </div>

          <div className='upgrade-list'>
            {UPGRADE_DEFS.map((upgrade) => {
              const level = upgradeLevels[upgrade.id];
              const cost = getUpgradeCost(upgrade, level);
              const canBuy = bankedRejections >= cost;

              return (
                <article key={upgrade.id} className='upgrade-card'>
                  <div className='upgrade-copy'>
                    <div className='upgrade-title-row'>
                      <strong>{upgrade.name}</strong>
                      <span>Level {level}</span>
                    </div>
                    <p>{upgrade.description}</p>
                    <div className='upgrade-features'>
                      <span>+{upgrade.clickBonus} click</span>
                      <span>+{upgrade.passiveBonus} per second</span>
                    </div>
                  </div>
                  <button type='button' onClick={() => buyUpgrade(upgrade.id)} disabled={!canBuy}>
                    Buy {formatNumber(cost)}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className='card log-panel dashboard-card'>
        <div className='section-head'>
          <div>
            <p className='eyebrow'>activity</p>
            <h2>Latest rejections</h2>
          </div>
          <p className='meta'>Most recent events are shown first.</p>
        </div>

        <div className='log-list'>
          {activityLog.map((entry) => (
            <article key={entry.id} className='log-item'>
              <div className='log-topline'>
                <strong>{entry.title}</strong>
                <span>{entry.source}</span>
              </div>
              <p>{entry.body}</p>
              <div className='log-meta'>
                <span>Impact {entry.amount}</span>
                <span>{entry.flavor}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
