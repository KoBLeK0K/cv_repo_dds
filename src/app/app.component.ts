import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  private lastScrollY = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initIntersectionObserver();
      this.initEcoScroll();
      this.initHeaderScroll();
    }
  }

  /** Плавное появление секций и футера по волне */
  initIntersectionObserver() {
    const blocks = Array.from(document.querySelectorAll('.block')) as HTMLElement[];
    const footer = document.querySelector('.footer') as HTMLElement | null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = blocks.indexOf(entry.target as HTMLElement);
            window.requestAnimationFrame(() => {
              setTimeout(() => {
                (entry.target as HTMLElement).classList.add('visible');
              }, index * 150); // постепенная волна
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    blocks.forEach((block) => observer.observe(block));
    if (footer) observer.observe(footer);
  }

  /** Мягкий «эко-поток» при скролле — секции подпрыгивают */
  initEcoScroll() {
    const blocks = Array.from(document.querySelectorAll('.block')) as HTMLElement[];
    const footer = document.querySelector('.footer') as HTMLElement | null;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      blocks.forEach((block, i) => {
        const isLast = i === blocks.length - 1;
        const factor = isLast ? 0.2 : 1; // последняя секция двигается минимально
        const offset = Math.sin((scrollY / 300) + i) * 12 * factor; // увеличиваем «яркость» движения
        block.style.transform = `translateY(${offset}px) scale(1)`;
      });

      if (footer) {
        const footerOffset = Math.sin(scrollY / 500) * 6; // чуть ярче движение футера
        footer.style.transform = `translateY(${footerOffset}px) scale(1)`;
      }
    });
  }

  /** Плавное скрытие хедера при скролле вниз и появление вверх */
  initHeaderScroll() {
    const header = document.getElementById('page-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      if (scrollY > this.lastScrollY && scrollY > 50) {
        // скролл вниз — скрываем хедер
        header.style.transform = 'translateY(-100%)';
        header.style.opacity = '0';
      } else {
        // скролл вверх — показываем хедер
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
      }

      this.lastScrollY = scrollY;
    });
  }
}