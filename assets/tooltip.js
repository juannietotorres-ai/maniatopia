(function () {
    'use strict';

    let activeTarget = null;
    let tooltip = null;
    let touchTarget = null;

    function positionTooltip() {
        if (!activeTarget || !tooltip || !activeTarget.isConnected) return;
        const bounds = activeTarget.getBoundingClientRect();
        const margin = 8;
        const gap = 12;
        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;
        const left = Math.max(margin, Math.min(bounds.left + (bounds.width - width) / 2, window.innerWidth - width - margin));
        let top = bounds.top - height - gap;
        if (top < margin) top = bounds.bottom + gap;
        top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
        if (activeTarget && tooltip) {
            const descriptions = (activeTarget.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== tooltip.id);
            if (descriptions.length) activeTarget.setAttribute('aria-describedby', descriptions.join(' '));
            else activeTarget.removeAttribute('aria-describedby');
        }
        if (tooltip) tooltip.remove();
        activeTarget = null;
        tooltip = null;
    }

    function showTooltip(target) {
        if (activeTarget !== target || !tooltip || !tooltip.isConnected) {
            hideTooltip();
            activeTarget = target;
            tooltip = document.createElement('span');
            tooltip.id = 'maniatopia-tooltip';
            tooltip.className = 'maniatopia-tooltip';
            tooltip.setAttribute('role', 'tooltip');
            (target.closest('dialog[open]') || document.body).appendChild(tooltip);
            const descriptions = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
            descriptions.push(tooltip.id);
            target.setAttribute('aria-describedby', descriptions.join(' '));
        }
        tooltip.textContent = target.dataset.help;
        tooltip.classList.add('is-visible');
        positionTooltip();
    }

    function targetFor(node) {
        return node instanceof Element ? node.closest('[data-help]') : null;
    }

    document.addEventListener('pointerover', (event) => {
        if (event.pointerType !== 'mouse') return;
        const target = targetFor(event.target);
        if (target) showTooltip(target);
    });
    document.addEventListener('pointerout', (event) => {
        const target = targetFor(event.target);
        if (event.pointerType === 'mouse' && target === activeTarget && target && !target.contains(event.relatedTarget)) hideTooltip();
    });
    document.addEventListener('focusin', (event) => {
        const target = targetFor(event.target);
        if (target) showTooltip(target);
    });
    document.addEventListener('focusout', (event) => {
        const target = targetFor(event.target);
        if (target && target === activeTarget && !target.contains(event.relatedTarget)) hideTooltip();
    });
    document.addEventListener('pointerdown', (event) => {
        const target = targetFor(event.target);
        if (event.pointerType === 'touch' && target) {
            if (touchTarget === target && activeTarget === target) {
                hideTooltip();
                touchTarget = null;
            } else {
                showTooltip(target);
                touchTarget = target;
            }
        } else if (!target) {
            hideTooltip();
            touchTarget = null;
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideTooltip();
            touchTarget = null;
        }
    });
    document.addEventListener('close', (event) => {
        if (activeTarget && event.target.contains(activeTarget)) hideTooltip();
    }, true);
    document.addEventListener('transitionend', (event) => {
        if (event.target === activeTarget) positionTooltip();
    });
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip, true);

    new MutationObserver((mutations) => {
        if (activeTarget && !activeTarget.isConnected) {
            hideTooltip();
            touchTarget = null;
        } else if (activeTarget && mutations.some((mutation) => mutation.target === activeTarget && mutation.attributeName === 'data-help')) {
            showTooltip(activeTarget);
        }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-help'] });
})();
