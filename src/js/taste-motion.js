(() => {
    if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const gsap = window.gsap;
    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);
    }

    gsap.from(".topbar", {
        y: -18,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out"
    });

    gsap.from(".setup-hero > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
    });

    gsap.from(".metric-card", {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        delay: 0.15,
        ease: "power3.out"
    });

    if (window.ScrollTrigger) {
        gsap.from(".setup-layout > *", {
            scrollTrigger: {
                trigger: ".setup-layout",
                start: "top 88%",
                toggleActions: "play none none reverse"
            },
            y: 36,
            opacity: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: "power3.out"
        });
    }
})();
