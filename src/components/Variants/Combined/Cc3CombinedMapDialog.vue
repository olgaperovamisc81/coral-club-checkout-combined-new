<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import type { MapPoint } from '@/components/Map/mapTypes'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'
import { reverseAddress } from '@/stand/suggest'
import type { AddressSuggestion } from '@/stand/suggest'

import Cc3CombinedInput from './Cc3CombinedInput.vue'
import Cc3CombinedSearchSheet from './Cc3CombinedSearchSheet.vue'

/**
 * Окно выбора адреса на карте. Метка стоит неподвижно в середине, под ней
 * двигают карту — так выбирают адрес в Озоне и Яндексе, — а адрес под меткой
 * определяется обратным геокодированием. Строка поиска внизу — не поле, а
 * вход в отдельное окно поиска: подсказкам там хватает места.
 */
const props = defineProps<{
  /** Строка адреса из формы — показывается в строке поиска. */
  query: string
  /** Где открыть карту, если адрес уже выбран на ней раньше. */
  point?: MapPoint
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: { suggestion?: AddressSuggestion; query: string }]
}>()

const { t, country } = useStand()
const { mapCenter } = useCheckout()

const text = computed(() => ({
  title: t('address.title'),
  close: t('common.close'),
  placeholder: t('concept.common.findAddress'),
  continue: t('common.continue'),
  geocodeError: t('map.geocodeError'),
  selectError: t('map.selectError'),
  pinTitle: t('map.pinTitle'),
  pinHint: t('map.pinHint'),
}))

const label = ref(props.query)
const suggestion = ref<AddressSuggestion>()
const point = ref<MapPoint | undefined>(props.point)
const isSearchOpen = ref(false)
// Геокодер не определил адрес под меткой: метка сдвинута, а подпись прежняя.
// Пока человек не передвинет метку заново или не найдёт адрес поиском,
// «Продолжить» неактивна — иначе окно закрылось бы с адресом другого места.
const isGeocodeFailed = ref(false)

const canContinue = computed(() => !isGeocodeFailed.value && Boolean(label.value.trim()))

// «Продолжить» не отключается молча: по нажатию без выбранного адреса окно
// объясняет, что нужно сделать.
const isContinueTried = ref(false)

const errorText = computed(() => {
  if (isGeocodeFailed.value) {
    return text.value.geocodeError
  }

  return isContinueTried.value && !label.value.trim() ? text.value.selectError : ''
})

// Карточка с адресом целиком: в строке поиска он обрезается, а под меткой
// человеку нужно прочитать его весь. Пока геокодер не определил адрес под
// новой меткой, прежний адрес не показываем — он принадлежит другому месту.
const fullAddress = computed(() => (isGeocodeFailed.value ? '' : label.value.trim()))

// Под картой стоит одна строка пояснения: ошибка, найденный адрес или, пока
// адреса нет, подсказка, как поставить метку.
const info = computed(() => {
  if (errorText.value) {
    return { kind: 'error', text: errorText.value }
  }

  if (fullAddress.value) {
    return { kind: 'address', text: fullAddress.value }
  }

  return { kind: 'hint', text: text.value.pinHint }
})

const infoClass = computed(() => `cc3-combined-map-dialog__info--${info.value.kind}`)
const infoRole = computed(() => (info.value.kind === 'error' ? 'alert' : undefined))

const center = computed<MapPoint>(() => point.value ?? mapCenter.value)

let reverseController: AbortController | undefined

/**
 * Тычок или сдвиг карты — обратное геокодирование. Метка стоит на месте,
 * адрес подставляется, когда придёт ответ: ждать ответа, чтобы показать
 * карту, значит показать залипшую карту.
 */
async function onMapMove(next: MapPoint) {
  point.value = next

  reverseController?.abort()
  reverseController = new AbortController()

  const controller = reverseController
  const found = await reverseAddress(next, country.value, controller.signal)

  // Новый тычок отменил этот запрос — ответ нужен уже ему, а не нам.
  if (controller.signal.aborted) {
    return
  }

  if (found) {
    suggestion.value = found
    label.value = found.label
    isGeocodeFailed.value = false
  } else {
    isGeocodeFailed.value = true
  }
}

function onPick(picked: AddressSuggestion) {
  suggestion.value = picked
  label.value = picked.label

  if (picked.lat !== undefined && picked.lng !== undefined) {
    point.value = { lat: picked.lat, lng: picked.lng }
  }

  isGeocodeFailed.value = false
  isSearchOpen.value = false
}

function onSubmitQuery(query: string) {
  suggestion.value = undefined
  label.value = query
  isGeocodeFailed.value = false
  isSearchOpen.value = false
}

function confirm() {
  if (!canContinue.value) {
    isContinueTried.value = true

    return
  }

  emit('confirm', { suggestion: suggestion.value, query: label.value })
}

/**
 * Высота карты — всё, что осталось от экрана. Числом, а не стилем: Cc3Map
 * считает по ней сетку тайлов, и у растянутой стилями карты низ остался бы
 * пустым.
 */
const MAP_FALLBACK_HEIGHT = 380

const mapBoxRef = ref<HTMLElement>()
const mapHeight = ref(MAP_FALLBACK_HEIGHT)

let observer: ResizeObserver | undefined

onMounted(() => {
  const element = mapBoxRef.value

  if (!element) {
    return
  }

  const measure = () => {
    const height = Math.round(element.getBoundingClientRect().height)

    if (height > 0) {
      mapHeight.value = height
    }
  }

  measure()

  observer = new ResizeObserver(measure)
  observer.observe(element)
})

/**
 * Пока окно открыто, страница под ним не прокручивается — иначе палец,
 * ведущий карту, возит чекаут за ней.
 */
let bodyOverflow = ''

onMounted(() => {
  bodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  observer?.disconnect()
  reverseController?.abort()
  document.body.style.overflow = bodyOverflow
})

watch(isSearchOpen, (open) => {
  // Закрытый поиск возвращает фокус окну, иначе Escape не дойдёт до него.
  if (!open) {
    document.querySelector<HTMLElement>('.cc3-combined-map-dialog')?.focus()
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  if (isSearchOpen.value) {
    isSearchOpen.value = false
  } else {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="cc3-combined-map-dialog"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <div class="cc3-combined-map-dialog__header">
        <h2 class="cc3-combined-map-dialog__title">{{ text.title }}</h2>

        <button
          type="button"
          class="cc3-combined-map-dialog__close"
          :aria-label="text.close"
          @click="emit('close')"
        >
          <Cc3Icon name="x-md" :size="24" />
        </button>
      </div>

      <!-- Тело — граница для шторки поиска: она занимает его почти целиком. -->
      <div class="cc3-combined-map-dialog__body">
        <div ref="mapBoxRef" class="cc3-combined-map-dialog__map">
          <Cc3Map
            :center="center"
            :zoom="14"
            :markers="[]"
            :height="mapHeight"
            @select="onMapMove"
            @move="onMapMove"
          />

          <!-- Строка поиска как остальные поля: подпись внутри, печатать нельзя — нажатие открывает шторку. -->
          <div class="cc3-combined-map-dialog__search">
            <Cc3CombinedInput
              :model-value="label"
              :label="text.placeholder"
              readonly
              :aria-label="text.placeholder"
              @focus="isSearchOpen = true"
            >
              <template #prefix>
                <Cc3Icon name="search-md" :size="20" />
              </template>
            </Cc3CombinedInput>
          </div>

          <span class="cc3-combined-map-dialog__pin">
            <Cc3MapPin variant="positive" icon="delivery-truck" />
          </span>
        </div>

        <div class="cc3-combined-map-dialog__controls">
          <h3 class="cc3-combined-map-dialog__pin-title">{{ text.pinTitle }}</h3>

          <p class="cc3-combined-map-dialog__info" :class="infoClass" :role="infoRole">
            {{ info.text }}
          </p>

          <button type="button" class="cc3-combined-map-dialog__continue" @click="confirm">
            {{ text.continue }}
          </button>
        </div>

        <template v-if="isSearchOpen">
          <div class="cc3-combined-map-dialog__dim" @click="isSearchOpen = false" />

          <Cc3CombinedSearchSheet
            :initial-query="label"
            @pick="onPick"
            @submit="onSubmitQuery"
          />
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.cc3-combined-map-dialog {
  color-scheme: light;

  @include cc3-light-tokens;
  @include cc3-combined-dialog-frame;

  background-color: var(--st-content-background-color-default-solid-normal);
  outline: none;

  // Окно карты с большим скруглением: карта доходит до его краёв, и острые
  // углы рядом с ней читались бы как обрезанный экран.
  @include mediaMinWidth('md') {
    border-radius: var(--st-global-distance-space-inset-6xl);
    overflow: hidden;
  }

  // Заголовок слева, круглая кнопка закрытия справа, без линии под шапкой:
  // карта начинается сразу под ней.
  &__header {
    position: relative;
    z-index: 4;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-2xl);

    padding: var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-xl);

    background-color: var(--st-content-background-color-default-solid-normal);

    @include mediaMinWidth('md') {
      padding: var(--st-global-distance-space-inset-4xl) var(--st-global-distance-space-inset-6xl)
        var(--st-global-distance-space-inset-2xl);
    }
  }

  // Тело — остаток экрана под шапкой и граница для шторки поиска.
  &__body {
    position: relative;
    z-index: 0;

    display: flex;
    flex: 1;
    flex-direction: column;

    min-height: 0;

    overflow: hidden;
  }

  // Затемнение под шторкой; нажатие на него шторку закрывает.
  &__dim {
    position: absolute;
    inset: 0;
    z-index: 2;

    background-color: var(--st-content-background-color-neutral-mute);
  }

  &__title {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    padding: 0;
    width: 40px;
    height: 40px;

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border: none;
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;
  }

  // Строка поиска лежит на карте сверху: низ окна занят пояснением и кнопкой.
  &__search {
    position: absolute;
    inset-block-start: var(--st-global-distance-space-inset-xl);
    inset-inline: var(--st-global-distance-space-inset-xl);
    z-index: 2;

    border-radius: var(--st-global-radius-md);
    box-shadow: 0 2px 8px 0 rgb(4 51 103 / 16%);
  }

  // Контейнер растягивается на весь остаток экрана, карта лежит в нём
  // абсолютно: иначе её высота влияла бы на высоту контейнера, а та
  // снова на неё.
  &__map {
    position: relative;

    flex: 1;

    min-height: 0;
    overflow: hidden;

    .cc3-map {
      position: absolute;
      inset: 0;

      border: none;
      border-radius: 0;
    }

    // На десктопе карта лежит в окне закруглённой плиткой с полями, а не
    // упирается в его края; тайлы приглушены, чтобы метка и зелёный цвет
    // версии были единственным акцентом на карте.
    @include mediaMinWidth('md') {
      margin-inline: var(--st-global-distance-space-inset-xl);

      border-radius: var(--st-global-radius-2xl);

      .cc3-map__tile {
        filter: saturate(0.4) brightness(1.04);
      }

      .cc3-map__zoom {
        gap: var(--st-global-distance-space-inset-sm);

        inset-inline-end: var(--st-global-distance-space-inset-xl);
        inset-block-end: var(--st-global-distance-space-inset-xl);
      }

      .cc3-map__zoom-button {
        width: 32px;
        height: 32px;

        border-radius: var(--st-global-radius-md);
      }
    }
  }

  // Метка накладкой по центру, а не маркером карты: маркер уезжал бы вместе
  // с тайлами. Сквозная для событий, иначе под ней нельзя было бы вести карту.
  &__pin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1;

    pointer-events: none;
    transform: translate(-50%, -100%);

    // Мягкий круг под остриём метки: показывает, куда она встанет.
    @include mediaMinWidth('md') {
      &::after {
        content: '';

        position: absolute;
        left: 50%;
        bottom: 0;
        z-index: -1;

        width: 64px;
        height: 64px;

        background-color: color-mix(
          in srgb,
          var(--st-action-background-color-positive-normal) 12%,
          transparent
        );
        border-radius: var(--st-global-radius-pill);
        transform: translate(-50%, 50%);
      }
    }
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-2xl);

    @include mediaMinWidth('md') {
      padding: var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-6xl)
        var(--st-global-distance-space-inset-4xl);
    }
  }

  // Как поставить метку: заголовок и пояснение под картой.
  &__pin-title {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__info {
    margin: 0 0 var(--st-global-distance-space-inset-md);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
    overflow-wrap: anywhere;

    // Найденный адрес читается основным цветом: он уже не подсказка.
    &--address {
      color: var(--st-content-foreground-color-neutral-primary);
    }

    &--error {
      color: var(--st-content-foreground-color-negative-primary);
    }
  }

  &__continue {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 52px;

    font-family: inherit;

    @include font('label-lg');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;
  }
}
</style>
