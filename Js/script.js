
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const closeMenu = () => {
        const menu = $(".nav-menu");
        const toggle = $(".menu-toggle");

        if (!menu || !toggle) return;

        menu.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");

        const icon = $("svg", toggle);

        if (icon) {
            icon.innerHTML = `
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
            `;
        }
    };

    const openMenu = () => {
        const menu = $(".nav-menu");
        const toggle = $(".menu-toggle");

        if (!menu || !toggle) return;

        menu.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation menu");

        const icon = $("svg", toggle);

        if (icon) {
            icon.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        }
    };



    /* Announcement bar */

    const announcement = $(".announcement-bar");
    const announcementClose = $(".announcement-close");

    if (announcement && announcementClose) {
        announcementClose.addEventListener("click", () => {
            announcement.classList.add("is-hidden");
        });
    }

    /* Mobile navigation */

    const menuToggle = $(".menu-toggle");
    const navMenu = $(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.contains("active");

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        $$(".nav-menu a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", event => {
            if (
                navMenu.classList.contains("active") &&
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 767) {
                closeMenu();
            }
        });
    }

    /* Header scroll effects */

    const header = $(".site-header");
    const backToTop = $(".back-to-top");

    const handleScroll = () => {
        const scrollY = window.scrollY;

        if (header) {
            header.classList.toggle("scrolled", scrollY > 20);
        }

        if (backToTop) {
            backToTop.classList.toggle("visible", scrollY > 500);
        }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    /* Back to top */

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "instant" : "smooth"
            });
        });
    }
const revealElements = $$(".reveal");

revealElements.forEach(element => {
    element.classList.add("revealed");
});
    /* Active navigation link */

    const sectionLinks = $$(".nav-link[href^='#']");
    const pageSections = sectionLinks
        .map(link => $(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && pageSections.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visibleSections.length) return;

            const currentId = visibleSections[0].target.id;

            sectionLinks.forEach(link => {
                const isActive = link.getAttribute("href") === `#${currentId}`;

                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }, {
            rootMargin: "-25% 0px -60% 0px",
            threshold: [0, 0.15, 0.35, 0.6]
        });

        pageSections.forEach(section => sectionObserver.observe(section));
    }

    /* Animated statistics */

    const statNumbers = $$("[data-count]");

    const animateCounter = element => {
        const target = Number(element.dataset.count);

        if (!Number.isFinite(target)) return;

        const suffix = element.dataset.suffix || "";
        const prefix = element.dataset.prefix || "";
        const duration = reducedMotion ? 0 : 1400;
        const startTime = performance.now();

        const updateCounter = now => {
            const progress = duration === 0
                ? 1
                : Math.min((now - startTime) / duration, 1);

            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(target * eased);

            element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    };

    if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        statNumbers.forEach(number => {
            counterObserver.observe(number);
        });
    } else {
        statNumbers.forEach(animateCounter);
    }

    /* Service filtering */

    const filterButtons = $$(".filter-btn");
    const serviceCards = $$(".service-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter || "all";

            filterButtons.forEach(filterButton => {
                const isActive = filterButton === button;

                filterButton.classList.toggle("active", isActive);
                filterButton.setAttribute("aria-pressed", String(isActive));
            });

            serviceCards.forEach(card => {
                const categories = (card.dataset.category || "")
                    .split(/\s+/)
                    .filter(Boolean);

                const matches = filter === "all" || categories.includes(filter);

                card.classList.toggle("is-filtered-out", !matches);

                if (matches && !reducedMotion) {
                    card.animate(
                        [
                            { opacity: 0.4, transform: "translateY(8px)" },
                            { opacity: 1, transform: "translateY(0)" }
                        ],
                        {
                            duration: 250,
                            easing: "ease-out"
                        }
                    );
                }
            });
        });
    });

    /* Toast notifications */

    const toastContainer = $(".toast-container");

    const showToast = (title, message, type = "success") => {
        if (!toastContainer) {
            window.alert(`${title}\n${message}`);
            return;
        }

        const toast = document.createElement("div");
        toast.className = `toast${type === "error" ? " toast-error" : ""}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const icon = type === "error"
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"></path></svg>`;

        const iconWrap = document.createElement("span");
        iconWrap.className = "toast-icon";
        iconWrap.innerHTML = icon;

        const content = document.createElement("div");
        content.className = "toast-content";

        const heading = document.createElement("strong");
        heading.textContent = title;

        const description = document.createElement("p");
        description.textContent = message;

        content.append(heading, description);
        toast.append(iconWrap, content);
        toastContainer.appendChild(toast);

        const removeToast = () => {
            if (!toast.isConnected) return;

            toast.classList.add("toast-removing");

            setTimeout(() => toast.remove(), reducedMotion ? 0 : 300);
        };

        const timeout = setTimeout(removeToast, 4500);

        toast.addEventListener("click", () => {
            clearTimeout(timeout);
            removeToast();
        });
    };

    /* Accessible modal helpers */

    let lastFocusedElement = null;

    const openModal = modal => {
        if (!modal) return;

        lastFocusedElement = document.activeElement;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        const focusTarget = $(".modal-close", modal) || $("button, a[href], input, select, textarea", modal);

        if (focusTarget) {
            setTimeout(() => focusTarget.focus(), 50);
        }
    };

    const closeModal = modal => {
        if (!modal) return;

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        if (!$(".modal-overlay.active")) {
            document.body.classList.remove("modal-open");
        }

        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    };

    $$(".modal-overlay").forEach(modal => {
        const closeButton = $(".modal-close", modal);

        if (closeButton) {
            closeButton.addEventListener("click", () => closeModal(modal));
        }

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            const activeModal = $(".modal-overlay.active");

            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });

    /* Service details modal */

    const serviceModal = $("#serviceModal");

    const serviceDetails = {
        strategy: {
            title: "Business Strategy & Consulting",
            description: "Build a clear direction for your business with practical planning, research and measurable goals.",
            features: [
                "Business analysis and market research",
                "Growth planning and opportunity assessment",
                "Brand positioning and competitive research",
                "Action plans with measurable objectives"
            ]
        },
        marketing: {
            title: "Digital Marketing",
            description: "Build a consistent digital presence and create campaigns designed around your business objectives.",
            features: [
                "Marketing strategy and campaign planning",
                "Search engine optimization planning",
                "Content and social media strategy",
                "Campaign performance reporting"
            ]
        },
        finance: {
            title: "Financial Planning",
            description: "Improve financial visibility with structured planning, budget analysis and business reporting.",
            features: [
                "Budget planning and expense analysis",
                "Cash-flow forecasting",
                "Financial performance dashboards",
                "Business planning support"
            ]
        },
        technology: {
            title: "Technology Solutions",
            description: "Explore digital tools and workflows that help your organization operate more efficiently.",
            features: [
                "Business website and digital experience planning",
                "Workflow and process automation assessment",
                "Software and tool recommendations",
                "Digital transformation roadmaps"
            ]
        },
        branding: {
            title: "Branding & Identity",
            description: "Create a consistent brand identity that communicates your business values and positioning.",
            features: [
                "Brand strategy and positioning",
                "Visual identity planning",
                "Brand messaging and tone",
                "Consistent digital brand guidelines"
            ]
        },
        operations: {
            title: "Business Operations",
            description: "Identify process improvements that support smoother day-to-day operations and sustainable growth.",
            features: [
                "Workflow assessment",
                "Process documentation",
                "Operational performance indicators",
                "Efficiency improvement planning"
            ]
        },
        default: {
            title: "Business Solutions",
            description: "Tell us about your business goals so we can explore an appropriate solution for your needs.",
            features: [
                "Understand your business requirements",
                "Explore suitable service options",
                "Discuss project scope and objectives",
                "Create a practical next-step plan"
            ]
        }
    };

    const populateServiceModal = (key, card) => {
        if (!serviceModal) return;

        const details = serviceDetails[key] || serviceDetails.default;
        const title = $("#serviceModalTitle", serviceModal);
        const description = $("#serviceModalDescription", serviceModal);
        const list = $("#serviceModalFeatures", serviceModal);

        if (title) title.textContent = details.title;
        if (description) description.textContent = details.description;

        if (list) {
            list.replaceChildren();

            details.features.forEach(feature => {
                const item = document.createElement("li");

                item.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m5 12 4 4L19 6"></path>
                    </svg>
                `;

                const text = document.createElement("span");
                text.textContent = feature;
                item.appendChild(text);
                list.appendChild(item);
            });
        }

        const serviceSelect = $("#service", $("#contactForm") || document);

        if (serviceSelect) {
            const matchingOption = [...serviceSelect.options].find(option =>
                option.value.toLowerCase().includes(key.toLowerCase()) ||
                option.textContent.toLowerCase().includes(details.title.toLowerCase())
            );

            if (matchingOption) {
                serviceSelect.value = matchingOption.value;
            }
        }

        if (card) {
            serviceModal.dataset.selectedService = key;
        }

        openModal(serviceModal);
    };

    $$(".service-more").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".service-card");
            const key = button.dataset.service || card?.dataset.service || "default";

            populateServiceModal(key, card);
        });
    });

    $$("[data-open-service]").forEach(button => {
        button.addEventListener("click", () => {
            populateServiceModal(button.dataset.openService || "default");
        });
    });

    const serviceModalCTA = $(".modal-cta", serviceModal || document);

    if (serviceModalCTA) {
        serviceModalCTA.addEventListener("click", () => {
            closeModal(serviceModal);

            const contactSection = $("#contact");

            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: reducedMotion ? "instant" : "smooth"
                });
            }
        });
    }

    /* Project details modal */

    const projectModal = $("#projectModal");

    $$(".project-open").forEach(button => {
        button.addEventListener("click", () => {
            if (!projectModal) return;

            const card = button.closest(".project-card");
            if (!card) return;

            const title = $("h3", card)?.textContent.trim() || "Project overview";
            const category = $(".project-type", card)?.textContent.trim() || "Business project";
            const description = card.dataset.description ||
                $("p", $(".project-info", card) || card)?.textContent.trim() ||
                "Explore the goals, approach and potential outcomes of this project.";

            const modalTitle = $("#projectModalTitle", projectModal);
            const modalCategory = $("#projectModalCategory", projectModal);
            const modalDescription = $("#projectModalDescription", projectModal);

            if (modalTitle) modalTitle.textContent = title;
            if (modalCategory) modalCategory.textContent = category;
            if (modalDescription) modalDescription.textContent = description;

            const image = $("img", $(".project-image", card) || card);
            const modalImage = $("#projectModalImage", projectModal);

            if (image && modalImage) {
                modalImage.src = image.currentSrc || image.src;
                modalImage.alt = image.alt || title;
            }

            openModal(projectModal);
        });
    });

    $$("[data-open-project]").forEach(button => {
        button.addEventListener("click", () => {
            if (!projectModal) return;

            const project = button.dataset.openProject;
            const card = $(`.project-card[data-project="${project}"]`);

            if (card) {
                $(".project-open", card)?.click();
            } else {
                const modalTitle = $("#projectModalTitle", projectModal);
                const modalDescription = $("#projectModalDescription", projectModal);

                if (modalTitle) modalTitle.textContent = button.dataset.title || "Project overview";
                if (modalDescription) {
                    modalDescription.textContent = button.dataset.description ||
                        "Contact us to discuss a similar project for your business.";
                }

                openModal(projectModal);
            }
        });
    });

    /* FAQ accordion */

    const faqItems = $$(".faq-item");

    faqItems.forEach(item => {
        const question = $(".faq-question", item);
        const answer = $(".faq-answer", item);

        if (!question) return;

        question.setAttribute(
            "aria-expanded",
            String(item.classList.contains("active"))
        );

        if (answer) {
            if (!answer.id) {
                answer.id = `faq-answer-${Math.random().toString(36).slice(2, 9)}`;
            }

            question.setAttribute("aria-controls", answer.id);
        }

        question.addEventListener("click", () => {
            const willOpen = !item.classList.contains("active");

            faqItems.forEach(otherItem => {
                otherItem.classList.remove("active");

                const otherQuestion = $(".faq-question", otherItem);

                if (otherQuestion) {
                    otherQuestion.setAttribute("aria-expanded", "false");
                }
            });

            if (willOpen) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
            }
        });
    });

    /* Testimonial slider */

    const testimonialTrack = $(".testimonial-track");
    const testimonialCards = $$(".testimonial-card");
    const previousButton = $(".testimonial-prev");
    const nextButton = $(".testimonial-next");

    let testimonialIndex = 0;

    const getVisibleTestimonials = () => {
        if (window.innerWidth <= 767) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    };

    const updateTestimonialSlider = () => {
        if (!testimonialTrack || !testimonialCards.length) return;

        const visibleCount = getVisibleTestimonials();
        const maxIndex = Math.max(0, testimonialCards.length - visibleCount);

        testimonialIndex = Math.min(testimonialIndex, maxIndex);
        testimonialIndex = Math.max(testimonialIndex, 0);

        const card = testimonialCards[0];
        const gap = parseFloat(getComputedStyle(testimonialTrack).gap) || 0;
        const cardWidth = card.getBoundingClientRect().width;
        const offset = testimonialIndex * (cardWidth + gap);

        testimonialTrack.style.transform = `translateX(-${offset}px)`;

        if (previousButton) {
            previousButton.disabled = testimonialIndex === 0;
            previousButton.setAttribute("aria-label", "Previous testimonials");
        }

        if (nextButton) {
            nextButton.disabled = testimonialIndex >= maxIndex;
            nextButton.setAttribute("aria-label", "Next testimonials");
        }
    };

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            testimonialIndex--;
            updateTestimonialSlider();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            testimonialIndex++;
            updateTestimonialSlider();
        });
    }

    window.addEventListener("resize", updateTestimonialSlider);
    updateTestimonialSlider();

    /* Contact form */

    const contactForm = $("#contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async event => {
            event.preventDefault();

            if (!contactForm.reportValidity()) return;

            const submitButton = $(".btn-submit", contactForm);
            const originalButtonHTML = submitButton?.innerHTML || "Send Message";

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            const formData = new FormData(contactForm);
            const action = contactForm.getAttribute("action");

            try {
                if (!action || action === "#") {
                    showToast(
                        "Form is not connected",
                        "Add a working form endpoint to the contact form before sending real enquiries.",
                        "error"
                    );
                    return;
                }

                const response = await fetch(action, {
                    method: (contactForm.method || "POST").toUpperCase(),
                    body: formData,
                    headers: {
                        Accept: "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("The form service returned an error.");
                }

                showToast(
                    "Message submitted",
                    "Your form service accepted the submission."
                );

                contactForm.reset();
            } catch (error) {
                showToast(
                    "Unable to send",
                    "Please check your connection and form endpoint, then try again.",
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            }
        });
    }

    /* Newsletter form */

    const newsletterForm = $(".newsletter-form");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", async event => {
            event.preventDefault();

            if (!newsletterForm.reportValidity()) return;

            const action = newsletterForm.getAttribute("action");
            const method = (newsletterForm.method || "POST").toUpperCase();
            const submitButton = $("button[type='submit']", newsletterForm);

            if (!action || action === "#") {
                showToast(
                    "Newsletter not connected",
                    "Connect a newsletter provider or backend endpoint to collect subscriptions.",
                    "error"
                );
                return;
            }

            const originalButtonHTML = submitButton?.innerHTML || "Subscribe";

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            try {
                const response = await fetch(action, {
                    method,
                    body: new FormData(newsletterForm),
                    headers: {
                        Accept: "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("The newsletter service returned an error.");
                }

                showToast(
                    "Subscription submitted",
                    "Your newsletter service accepted the subscription."
                );

                newsletterForm.reset();
            } catch (error) {
                showToast(
                    "Subscription failed",
                    "Please try again or check your newsletter service configuration.",
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            }
        });
    }

    /* Smooth anchor scrolling */

    $$("a[href^='#']").forEach(link => {
        link.addEventListener("click", event => {
            const href = link.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            const target = $(href);

            if (!target) return;

            event.preventDefault();

            closeMenu();

            target.scrollIntoView({
                behavior: reducedMotion ? "instant" : "smooth",
                block: "start"
            });

            if (history.replaceState) {
                history.replaceState(null, "", href);
            }
        });
    });

    /* Current year */

    $$("[data-current-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    /* Image fallback */

    $$("img[data-fallback]").forEach(img => {
        img.addEventListener("error", () => {
            const fallback = img.dataset.fallback;

            if (fallback && img.src !== new URL(fallback, document.baseURI).href) {
                img.src = fallback;
            }
        }, { once: true });
    });

    /* Keyboard-friendly modal focus */

    document.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;

        const modal = $(".modal-overlay.active");

        if (!modal) return;

        const focusable = $$(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            modal
        ).filter(element => element.offsetParent !== null);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
});

if (window.lucide) {
    window.lucide.createIcons();
}