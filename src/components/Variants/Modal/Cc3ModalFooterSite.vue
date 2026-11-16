<script setup lang="ts">
import { computed } from 'vue'

import coralclubLogoFooter from '@/assets/modal/coralclub-logo-footer.svg'
import socialVk from '@/assets/modal/social-vk.svg'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

/**
 * Сайтовый подвал: логотип, копирайт, язык, ссылки. Только оформление,
 * поведения у него нет.
 */
const { t, country, locale } = useStand()

const text = computed(() => ({
  privacy: t('consent.privacy'),
  copyright: t('footer.copyright'),
  language: `${t(`country.${country.value}`)} | ${locale.value.toUpperCase()}`,
}))
</script>

<template>
  <div class="cc3-modal-footer-site">
    <div class="cc3-modal-footer-site__legal">
      <img :src="coralclubLogoFooter" alt="Coral Club" class="cc3-modal-footer-site__logo" />
      <p class="cc3-modal-footer-site__copyright">
        {{ text.copyright }}
      </p>
    </div>

    <div class="cc3-modal-footer-site__links">
      <p class="cc3-modal-footer-site__lang">
        <Cc3Icon name="location-map" :size="24" />
        {{ text.language }}
      </p>

      <a href="#" class="cc3-modal-footer-site__link">{{ text.privacy }}</a>
      <a href="tel:88001000577" class="cc3-modal-footer-site__link">8 (800) 100 05 77</a>

      <img :src="socialVk" alt="" class="cc3-modal-footer-site__social" />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-footer-site {
  padding-top: var(--st-global-distance-space-inset-6xl);

  background-color: var(--st-content-background-color-neutral-subtle);

  &__legal {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-2xl);
  }

  &__logo {
    // SVG-ассет сохранён с preserveAspectRatio="none" — сам растягивается
    // под любые размеры img. Без align-self он ещё и растягивается по
    // ширине контейнера (это flex-item в колонке, где stretch — дефолт).
    align-self: flex-start;

    width: auto;
    height: 28px;
  }

  &__copyright {
    margin: 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-primary);
    opacity: 0.64;
  }

  &__links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-8xl) var(--st-global-distance-space-inset-2xl);

    background-color: var(--st-content-background-color-neutral-onsubtle);
  }

  &__lang {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    margin: 0;

    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
    opacity: 0.8;
  }

  &__link {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    text-decoration: none;
  }

  &__social {
    margin-top: var(--st-global-distance-space-inset-md);
    width: 44px;
    height: 40px;

    // В исходном ассете иконка перевёрнута — Figma тоже отражает её
    // обратно через transform, а не хранит отдельным файлом.
    transform: scaleY(-1);
  }
}
</style>
