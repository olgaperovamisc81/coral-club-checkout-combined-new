<script setup lang="ts">
import { computed, reactive } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useAddressGuard } from '@/composables/useAddressGuard'
import { useCourierVariants } from '@/composables/useCourierVariants'
import { useStand } from '@/stand/composables/useStand'

import Cc3CombinedCarousel from './Cc3CombinedCarousel.vue'

/**
 * Способ доставки курьера в комбинированной версии: сгруппированный список
 * вместо отдельных карточек. Пока адрес не заполнен, вместо цен стоит
 * плашка-подсказка, и она же объясняет, чего не хватает для оплаты:
 * заполнение формы адреса здесь и есть «сохранение», отдельной кнопки нет.
 *
 * Заголовок рисует тот, кто ставит блок, — как и у остальных блоков
 * страницы.
 */
const props = defineProps<{
  /** Адрес заполнен — показываем варианты, иначе плашку. */
  resolved: boolean
}>()

const selected = defineModel<string>({ default: 'standard' })

const { t } = useStand()
const { courierVariants } = useCourierVariants()
const { isWarningVisible } = useAddressGuard()

const text = computed(() => ({
  hintLink: t('delivery.variants.hintLink'),
  hintRest: t('delivery.variants.hintRest'),
  required: t('combined.addressRequired'),
}))

/**
 * «Укажите адрес» — ссылка: подскролливает к строке адреса и ставит в неё
 * курсор. Если формы на экране нет (адрес не выбран из книги после удаления),
 * ведёт к началу блока доставки, где предложено выбрать или добавить адрес.
 */
function goToAddress() {
  const field = document.querySelector<HTMLInputElement>('.cc3-combined-address-form input')
  const target = field ?? document.querySelector<HTMLElement>('.cc3-combined-delivery')

  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  field?.focus({ preventScroll: true })
}

// Описание варианта («Доступно для заказов…») спрятано за значком «i» и
// раскрывается по нажатию, у каждой карточки отдельно.
const openCaptions = reactive<Record<string, boolean>>({})

function toggleCaption(id: string) {
  openCaptions[id] = !openCaptions[id]
}

const isWarning = computed(() => !props.resolved && isWarningVisible.value)
</script>

<template>
  <Cc3CombinedCarousel v-if="resolved">
    <label
      v-for="variant in courierVariants"
      :key="variant.id"
      class="cc3-combined-delivery-options__row"
    >
      <!--
        Радио стоит в разметке первым: подпись связывает нажатие с первым
        элементом внутри себя, и кнопка «i» перед радио забирала бы нажатие
        по карточке. На экране радио уходит вправо через order.
      -->
      <input
        v-model="selected"
        type="radio"
        name="cc3-combined-courier-variant"
        :value="variant.id"
        class="cc3-combined-delivery-options__radio"
      />

      <span class="cc3-combined-delivery-options__content">
        <span class="cc3-combined-delivery-options__title">
          {{ variant.title }}

          <!-- Кнопка внутри подписи не выбирает карточку: нажатие по ней только раскрывает описание. -->
          <button
            v-if="variant.caption"
            type="button"
            class="cc3-combined-delivery-options__info-button"
            :aria-label="variant.title"
            :aria-expanded="openCaptions[variant.id]"
            @click.prevent="toggleCaption(variant.id)"
          >
            <Cc3Icon name="info-circle" :size="16" />
          </button>
        </span>
        <span
          v-if="variant.caption && openCaptions[variant.id]"
          class="cc3-combined-delivery-options__caption"
        >
          {{ variant.caption }}
        </span>
      </span>
    </label>
  </Cc3CombinedCarousel>

  <div v-else class="cc3-combined-delivery-options__placeholder">
    <p v-if="isWarning" class="cc3-combined-delivery-options__warning" role="alert">
      {{ text.required }}
    </p>

    <p class="cc3-combined-delivery-options__hint">
      <button type="button" class="cc3-combined-delivery-options__hint-link" @click="goToAddress">
        {{ text.hintLink }}
      </button>{{ text.hintRest }}
    </p>
  </div>
</template>

<style lang="scss">
.cc3-combined-delivery-options {
  // Карточка в две колонки: блок текста слева на всю высоту, радио справа
  // внизу. Между ними зазор, чтобы длинная подпись не упиралась в радио.
  &__row {
    @include cc3-combined-carousel-card;

    display: flex;
    align-items: stretch;
    gap: var(--st-global-distance-space-inset-xl);

    width: 232px;
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-x);

    min-width: 0;
  }

  // Название карточки того же шрифта, что название способа оплаты ниже.
  &__title {
    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__info-button {
    @include cc3-combined-info-button;

    // На строке с названием, по центру первой строки.
    vertical-align: middle;
  }

  // Подписи-описания мельче названия: 14.
  &__caption {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__radio {
    @include cc3-combined-carousel-radio;

    order: 1;
    align-self: flex-end;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__hint {
    margin: 0;
    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-tetriary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border-radius: var(--st-global-radius-md);
  }

  // Ссылка внутри серой строки-подсказки: подчёркнутая, цвет ссылок версии.
  &__hint-link {
    @include cc3-combined-link;
  }

  // Без рамки и подложки: в рамке строка читается как ещё одна кнопка,
  // а нажимать на неё нечего.
  &__warning {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
  }
}
</style>
