<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import cardIcon from '@/assets/payment-icons/credit-card.png'
import paypalIcon from '@/assets/payment-icons/paypal.png'
import sberpayIcon from '@/assets/payment-icons/sberpay.png'
import sbpIcon from '@/assets/payment-icons/sbp.png'
import bankTransferIcon from '@/assets/payment-icons/bank-transfer.svg'
import Cc3PaymentMarks from '@/components/Payment/Cc3PaymentMarks.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'
import { conceptPaymentMethodsFor } from '@/stand/config/payments'
import type { PaymentMark } from '@/stand/config/payments'

import Cc3CombinedCarousel from './Cc3CombinedCarousel.vue'

/**
 * Способы оплаты комбинированной версии: тот же набор, что у остальных
 * концептов (он зависит от рынка), но каруселью карточек. Набор берётся из
 * конфига рынка — здесь его не перечисляем.
 *
 * Новому покупателю показывается карусель сразу. У покупателя с сохранёнными
 * адресами способ уже выбран — картой, — поэтому вместо карусели строка с
 * его названием и кнопкой «Изменить», как у «Куда доставить»: нажатие
 * раскрывает карусель, а выбор способа сворачивает её обратно.
 */
const { country, t, hasSavedAddresses } = useStand()

type Method = {
  id: string
  name: string
  icon: string
  marks?: PaymentMark[]
}

const icons: Record<string, string> = {
  'bank-card': cardIcon,
  paypal: paypalIcon,
  sbp: sbpIcon,
  card: cardIcon,
  sberpay: sberpayIcon,
  yoomoney: bankTransferIcon,
}

const methods = computed<Method[]>(() =>
  conceptPaymentMethodsFor(country.value).map((method) => ({
    id: method.id,
    name: t(method.labelKey),
    icon: icons[method.id] ?? cardIcon,
    marks: method.marks,
  })),
)

const text = computed(() => ({
  title: t('payment.title'),
  change: t('common.change'),
}))

/**
 * Способ по умолчанию. У покупателя с сохранёнными адресами это карта: она
 * у него уже привязана. Новому — первый в наборе рынка.
 */
function defaultMethodId(list: Method[]): string {
  const card = list.find((method) => method.id.endsWith('card'))

  return (hasSavedAddresses.value ? card?.id : undefined) ?? list[0]?.id ?? ''
}

const selected = ref(defaultMethodId(methods.value))

// Раскрыта ли карусель у покупателя с сохранёнными адресами.
const isEditing = ref(false)

const isSummary = computed(() => hasSavedAddresses.value && !isEditing.value)

const selectedName = computed(
  () => methods.value.find((method) => method.id === selected.value)?.name ?? '',
)

function startEdit() {
  isEditing.value = true
}

// Нажатие на карточку сворачивает карусель, в том числе на уже выбранную:
// событие change в этом случае не приходит.
function finishEdit() {
  isEditing.value = false
}

// Смена страны меняет сам список: выбранного способа в нём может уже не
// быть, и тогда не выбрано ничего — возвращаем выбор на способ по умолчанию.
watch(methods, (list) => {
  if (!list.some((method) => method.id === selected.value)) {
    selected.value = defaultMethodId(list)
  }
})

// Переключили тип покупателя: способ и вид блока начинаются заново.
watch(hasSavedAddresses, () => {
  selected.value = defaultMethodId(methods.value)
  isEditing.value = false
})
</script>

<template>
  <section class="cc3-combined-payment">
    <div v-if="isSummary" class="cc3-combined-payment__summary">
      <h2 class="cc3-combined-payment__method-title">{{ selectedName }}</h2>

      <button type="button" class="cc3-combined-payment__change" @click="startEdit">
        <Cc3Icon name="edit-01" :size="16" />
        {{ text.change }}
      </button>
    </div>

    <template v-else>
      <h2 class="cc3-combined-payment__title">{{ text.title }}</h2>

      <Cc3CombinedCarousel>
        <label v-for="method in methods" :key="method.id" class="cc3-combined-payment__row">
          <span class="cc3-combined-payment__method">
            <img :src="method.icon" alt="" class="cc3-combined-payment__icon" />

            <span class="cc3-combined-payment__label">
              <span class="cc3-combined-payment__name">{{ method.name }}</span>

              <Cc3PaymentMarks v-if="method.marks" :marks="method.marks" />
            </span>
          </span>

          <input
            v-model="selected"
            type="radio"
            name="cc3-combined-payment"
            :value="method.id"
            class="cc3-combined-payment__radio"
            @click="finishEdit"
          />
        </label>
      </Cc3CombinedCarousel>
    </template>
  </section>
</template>

<style lang="scss">
.cc3-combined-payment {
  // Сверху 12 к зазору между блоками страницы (тоже 12): от блока над ним до
  // строки заголовка выходит 24, как у остальных заголовков.
  padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl) 0;

  // Строка выбранного способа: название слева, «Изменить» справа, как у
  // «Куда доставить».
  &__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--st-global-distance-space-inset-sm) 0;
  }

  &__method-title {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__change {
    @include cc3-combined-change-button;
  }

  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) 0
      calc(var(--st-global-distance-space-inset-xl) + var(--st-global-distance-space-inset-x));

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__row {
    @include cc3-combined-carousel-card;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);
  }

  &__label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__method {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inline-md);
  }

  // У логотипов своя круглая подложка внутри самого файла: вторая вокруг
  // них давала лишнюю серую обводку.
  &__icon {
    flex-shrink: 0;

    width: 28px;
    height: 28px;

    border-radius: var(--st-global-radius-pill);
    object-fit: cover;
  }

  &__name {
    white-space: nowrap;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__radio {
    @include cc3-combined-carousel-radio;
  }
}
</style>
