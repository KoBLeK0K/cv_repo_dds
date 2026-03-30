import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  private lastScrollY = 0;
  
  profilePhoto = 'assets/main-profile-photo.jpg';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initIntersectionObserver();
    this.initEcoScroll();
    this.initHeaderScroll();
  }

  /** Плавное появление секций и футера по «волне» */
  private initIntersectionObserver() {
    const blocks = Array.from(document.querySelectorAll('.block')) as HTMLElement[];
    const footer = document.querySelector('.footer') as HTMLElement | null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = blocks.indexOf(entry.target as HTMLElement);
          // плавная волна сверху вниз
          window.requestAnimationFrame(() => {
            setTimeout(() => {
              (entry.target as HTMLElement).classList.add('visible');
            }, index * 150);
          });
        });
      },
      { threshold: 0.15 }
    );

    blocks.forEach((block) => observer.observe(block));
    if (footer) observer.observe(footer);
  }

  /** Мягкий «эко-поток» при скролле — секции слегка подпрыгивают, футер двигается */
  private initEcoScroll() {
    const blocks = Array.from(document.querySelectorAll('.block')) as HTMLElement[];
    const footer = document.querySelector('.footer') as HTMLElement | null;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      blocks.forEach((block, i) => {
        const factor = i === blocks.length - 1 ? 0.2 : 1; // последняя секция двигается минимально
        const offset = Math.sin((scrollY / 300) + i) * 12 * factor; // амплитуда движения
        block.style.transform = `translateY(${offset}px) scale(1)`;
      });

      if (footer) {
        const footerOffset = Math.sin(scrollY / 500) * 6;
        footer.style.transform = `translateY(${footerOffset}px) scale(1)`;
      }
    });
  }

  /** Хедер исчезает при скролле вниз и возвращается вверх */
  private initHeaderScroll() {
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