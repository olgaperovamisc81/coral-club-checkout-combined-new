<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

/**
 * Горизонтальная карусель: карточки или чипсы в один ряд, листаются вбок и
 * прилипают к левому краю. На телефоне ряд листают пальцем. На десктопе,
 * при наведении, по краям появляются стрелки для мыши — только в ту
 * сторону, куда ещё есть что листать.
 *
 * Стрелки — помощник для указателя, а не отдельный способ управления:
 * с клавиатуры карточки листаются сами, когда на них переходят по Tab, а
 * читалке экрана лишние кнопки только мешали бы. Поэтому они скрыты от
 * неё и не берут фокус.
 *
 * Ряд выходит за поля блока и возвращает их внутренним отступом, поэтому
 * первая карточка стоит на линии остальных блоков, а при прокрутке карточки
 * уходят под самый край экрана.
 */
const trackRef = ref<HTMLElement>()
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

/** Доля ширины ряда, на которую сдвигает одно нажатие стрелки. */
const STEP = 0.8

/** Запас в пикселях: у края прокрутка редко равна нулю точно. */
const EDGE = 2

function update() {
  const track = trackRef.value

  if (!track) {
    return
  }

  canScrollPrev.value = track.scrollLeft > EDGE
  canScrollNext.value = track.scrollLeft + track.clientWidth < track.scrollWidth - EDGE
}

function scrollByStep(direction: 1 | -1) {
  const track = trackRef.value

  track?.scrollBy({ left: direction * track.clientWidth * STEP, behavior: 'smooth' })
}

function scrollPrev() {
  scrollByStep(-1)
}

function scrollNext() {
  scrollByStep(1)
}

// Размер ряда меняется с окном, а состав — когда приходят другие варианты:
// следим за тем и другим, иначе стрелка не появится у нового длинного ряда.
let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined

onMounted(() => {
  const track = trackRef.value

  if (!track) {
    return
  }

  update()

  resizeObserver = new ResizeObserver(update)
  resizeObserver.observe(track)

  mutationObserver = new MutationObserver(update)
  mutationObserver.observe(track, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<template>
  <div class="cc3-combined-carousel">
    <div ref="trackRef" class="cc3-combined-carousel__track" @scroll.passive="update">
      <slot />
    </div>

    <button
      v-if="canScrollPrev"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      class="cc3-combined-carousel__arrow cc3-combined-carousel__arrow--prev"
      @click="scrollPrev"
    >
      <Cc3Icon name="chevron-down" :size="20" />
    </button>

    <button
      v-if="canScrollNext"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      class="cc3-combined-carousel__arrow cc3-combined-carousel__arrow--next"
      @click="scrollNext"
    >
      <Cc3Icon name="chevron-down" :size="20" />
    </button>
  </div>
</template>

<style lang="scss">
.cc3-combined-carousel {
  position: relative;

  &__track {
    @include cc3-combined-carousel;

    > * {
      flex: 0 0 auto;

      scroll-snap-align: start;
    }
  }

  // Стрелки только для мыши: на телефоне ряд листают пальцем, а наведения
  // там нет.
  &__arrow {
    position: absolute;
    top: 50%;
    z-index: 1;

    display: none;
    align-items: center;
    justify-content: center;

    padding: 0;
    width: 32px;
    height: 32px;

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-pill);
    box-shadow: 0 2px 8px 0 rgb(4 51 103 / 16%);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease;

    &--prev {
      left: 0;

      transform: translateY(-50%) rotate(90deg);
    }

    &--next {
      right: 0;

      transform: translateY(-50%) rotate(-90deg);
    }

    @include mediaMinWidth('lg') {
      display: flex;
    }
  }

  &:hover &__arrow {
    opacity: 1;
  }
}
</style>
