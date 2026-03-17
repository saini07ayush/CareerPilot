import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticleBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
            }}
            options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: "repulse" },
                    },
                    modes: {
                        repulse: { distance: 100, duration: 0.4 },
                    },
                },
                particles: {
                    color: { value: "#e8a020" },
                    links: {
                        color: "#e8a020",
                        distance: 150,
                        enable: true,
                        opacity: 0.15,
                        width: 0.5,
                    },
                    move: {
                        enable: true,
                        speed: 0.6,
                        outModes: { default: "bounce" },
                    },
                    number: {
                        density: { enable: true, area: 900 },
                        value: 60,
                    },
                    opacity: { value: 0.3 },
                    size: { value: { min: 1, max: 2 } },
                },
                detectRetina: true,
            }}
        />
    );
}