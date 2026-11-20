<script setup lang="ts">
import { computed, ref } from 'vue'

import { useStand } from '@/stand/composables/useStand'
import type { AddressSuggestion } from '@/stand/suggest'

import Cc3CombinedNotice from '../Cc3CombinedNotice.vue'
import Cc3CombinedPickupFilters from './Cc3CombinedPickupFilters.vue'
import Cc3CombinedPickupListSearch from './Cc3CombinedPickupListSearch.vue'

/**
 * Вкладка «Список»: поле адреса с подсказками под ним, фильтр по службам и
 * пункты в столбик. Поле печатает прямо здесь, без шторки — подсказки те же,
 * что на карте, но стоят в потоке страницы.
 */
type PickupListItem = {
  id: string
  name: string
  address: string
  /** Цена доставки в пункт: «Бесплатно» или сумма. */
  price: string
  closed?: boolean
}

type PickupFilter = {
  id: string
  label: string
  active: boolean
}

defineProps<{
  points: PickupListItem[]
  filters: PickupFilter[]
  /** Адрес, выбранный в поиске; пока не выбран — поле пустое. */
  address: string
  /** Пояснение под фильтрами: рядом с адресом пунктов нет. */
  notice?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  filter: [id: string]
  pick: [suggestion: AddressSuggestion]
  clear: []
}>()

const { t } = useStand()

// Пока человек ищет адрес, ряд чипсов не нужен: он встаёт между подсказками и
// результатами и читается как лишний слой. Вернётся, как только поиск закончен.
const isSearching = ref(false)

const text = computed(() => ({
  closedNow: t('pickup.closedNow'),
  select: t('common.select'),
}))
</script>

<template>
  <div class="cc3-combined-pickup-list">
    <Cc3CombinedPickupListSearch
      :address="address"
      @pick="emit('pick', $event)"
      @clear="emit('clear')"
      @active="isSearching = $event"
    />

    <Cc3CombinedPickupFilters v-if="!isSearching" :filters="filters" @select="emit('filter', $event)" />

    <Cc3CombinedNotice
      v-if="notice"
      tone="warning"
      class="cc3-combined-pickup-list__notice"
    >
      {{ notice }}
    </Cc3CombinedNotice>

    <div v-if="points.length > 0" class="cc3-combined-pickup-list__items">
      <div v-for="point in points" :key="point.id" class="cc3-combined-pickup-list__item">
        <button type="button" class="cc3-combined-pickup-list__info" @click="emit('select', point.id)">
          <span class="cc3-combined-pickup-list__name">{{ point.name }}</span>
          <span class="cc3-combined-pickup-list__address">{{ point.address }}</span>
          <span v-if="point.closed" class="cc3-combined-pickup-list__closed">
            {{ text.closedNow }}
          </span>
        </button>

        <span class="cc3-combined-pickup-list__price">{{ point.price }}</span>

        <button type="button" class="cc3-combined-pickup-list__choose" @click="emit('select', point.id)">
          {{ text.select }}
        </button>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
.cc3-combined-pickup-list {
  display: flex;
  flex: 1;
  flex-direction: column;

  min-height: 0;

  &__notice {
    margin: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-md);
  }

  // Список прокручивается сам, а окно остаётся на месте — кнопка внизу всегда видна.
  &__items {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-height: 0;

    overflow-y: auto;
    overscroll-behavior: contain;
  }

  // Пункт по макету Figma: слева название и адрес, справа цена и кнопка
  // «Выбрать». На телефоне цена и кнопка уходят отдельной строкой под текст.
  &__item {
    position: relative;

    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);

    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);
    width: 100%;

    // Разделитель между пунктами не доходит до краёв окна: по 16px с каждой
    // стороны, как поля у текста.
    & + &::before {
      content: '';

      position: absolute;
      inset-block-start: 0;
      inset-inline: var(--st-global-distance-space-inset-2xl);

      height: 1px;

      background-color: var(--st-content-border-color-neutral-onsubtle);
    }

    @include mediaMinWidth('md') {
      flex-wrap: nowrap;

      padding-block: var(--st-global-distance-space-inset-2xl);
    }
  }

  // Текстовая часть пункта нажимается так же, как кнопка «Выбрать».
  &__info {
    display: flex;
    flex: 1 0 100%;
    flex-direction: column;

    padding: 0;
    min-width: 0;

    font-family: inherit;
    text-align: start;

    background: none;
    border: none;
    cursor: pointer;

    @include mediaMinWidth('md') {
      flex: 1;
    }
  }

  &__name {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__address {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__closed {
    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__price {
    flex: 1;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);

    @include mediaMinWidth('md') {
      flex: none;
    }
  }

  &__choose {
    flex-shrink: 0;

    padding: 0 var(--st-global-distance-space-inset-2xl);
    height: 40px;

    font-family: inherit;

    @include font('label-sm');

    // Вторичная кнопка: тёмный текст на белом, контурная обводка.
    color: var(--st-action-foreground-color-neutral-normal);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;
  }
}
</style>
