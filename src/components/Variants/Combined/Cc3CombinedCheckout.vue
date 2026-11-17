<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useAddressGuard } from '@/composables/useAddressGuard'
import { useCheckout } from '@/composables/useCheckout'
import { useCheckoutSubmit } from '@/composables/useCheckoutSubmit'
import { useCourierVariants } from '@/composables/useCourierVariants'
import { useSlotConflict } from '@/composables/useSlotConflict'
import { useStand } from '@/stand/composables/useStand'
import { hasDeliverySlots } from '@/stand/config/deliverySlots'

// Хедер, сводка заказа и подвал те же, что в остальных концептах —
// переиспользуем компоненты напрямую, а не копируем разметку. Своё у этой
// версии — блок доставки, способ доставки и способ оплаты.
import Cc3InlineDeliverySlots from '../Inline/Cc3InlineDeliverySlots.vue'
import Cc3ModalFooterConsent from '../Modal/Cc3ModalFooterConsent.vue'
import Cc3ModalFooterCta from '../Modal/Cc3ModalFooterCta.vue'
import Cc3ModalFooterSite from '../Modal/Cc3ModalFooterSite.vue'
import Cc3ModalHeader from '../Modal/Cc3ModalHeader.vue'
import Cc3ModalSummaryBar from '../Modal/Cc3ModalSummaryBar.vue'
import type { DeliveryProfile, DeliveryProfileMethod } from '../Modal/deliveryProfile'
import Cc3CombinedDeliveryOptions from './Cc3CombinedDeliveryOptions.vue'
import Cc3CombinedDeliverySection from './Cc3CombinedDeliverySection.vue'
import Cc3CombinedNotice from './Cc3CombinedNotice.vue'
import Cc3CombinedPaymentMethods from './Cc3CombinedPaymentMethods.vue'
import Cc3CombinedExtrasCard from './Cc3CombinedExtrasCard.vue'
import Cc3CombinedTotalCard from './Cc3CombinedTotalCard.vue'

/**
 * Комбинированная версия: берёт форму прямо на странице у инлайна, а адресную
 * книгу, карту и поиск — окнами, как модальная. Поля с подписью внутри,
 * способ доставки и оплаты — сгруппированными списками.
 *
 * Адрес считается добавленным, когда заполнены обязательные поля: кнопки
 * «Сохранить» нет. Пока полей не хватает, вместо способов доставки стоит
 * плашка, а оплата не создаёт заказ — см. useAddressGuard.
 */
const { summary, setDeliveryPrice } = useCheckout()
const { t, country } = useStand()
const { courierVariants, defaultVariantId, priceOf } = useCourierVariants()

const consentRef = ref<InstanceType<typeof Cc3ModalFooterConsent>>()

// Галочки и кнопка стоят в разных колонках, но ошибка про условия у них одна.
const { isTermsErrorShown, submit } = useCheckoutSubmit(true, () =>
  consentRef.value?.scrollToTerms(),
)

const text = computed(() => ({
  optionsTitle: t('delivery.variants'),
  slotTaken: t('delivery.slotTaken'),
  slotRequired: t('delivery.slotRequired'),
}))

/**
 * Два варианта сводки для сравнения, выбор — параметром адреса `?summary=`:
 * `one` (по умолчанию) — одна карточка, скидки внутри над итогом; `two` — две
 * карточки, вторая со скидками только с обводкой.
 */
const isSummaryMerged = new URLSearchParams(window.location.search).get('summary') !== 'two'

const state = ref<{
  method: DeliveryProfileMethod
  profile?: DeliveryProfile
  recipientReady: boolean
  fromBook: boolean
}>({
  method: 'courier',
  recipientReady: false,
  fromBook: false,
})

const { armGuard, disarmGuard, setAddressSaved } = useAddressGuard()

// Блок доставки сообщает состояние ещё в своём setup, то есть до onMounted
// родителя. Поэтому после взвода сторожа сразу пересказываем ему, что уже есть.
onMounted(() => {
  armGuard()
  setAddressSaved(Boolean(state.value.profile) && state.value.recipientReady)
})

onBeforeUnmount(disarmGuard)

function onState(payload: {
  method: DeliveryProfileMethod
  profile?: DeliveryProfile
  recipientReady: boolean
  fromBook: boolean
}) {
  state.value = payload
  setAddressSaved(Boolean(payload.profile) && payload.recipientReady)
}

/**
 * Блок способов показывается только у курьера. У пункта выдачи выбирать
 * нечего: цена и срок принадлежат самому пункту, они видны в его карточке.
 */
const isOptionsVisible = computed(() => state.value.method === 'courier')

const isResolved = computed(() => Boolean(state.value.profile))

// Адрес из книги — слот выбирают сами: сначала дату, потом время. У нового
// адреса слот подставляется первым доступным, как раньше.
const isSlotChoiceExplicit = computed(() => state.value.fromBook)

const courierVariant = ref(defaultVariantId.value)

// Имитация «слот пропал к оплате»: проверка включена, только когда слоты
// есть на экране — у курьера, с выбранным адресом и в стране со слотами.
const { arm, registerAnchor, isMessageVisible, isChoiceMissing } = useSlotConflict()
const slotsRef = ref<HTMLElement>()

// Слоты есть только на части рынков. Без них обёртка под списком способов
// оставалась пустой, но со своим верхним отступом — и заголовок следующего
// блока стоял на 16 дальше, чем положено.
const hasSlots = computed(() => hasDeliverySlots(country.value))
const isSlotsVisible = computed(() => isResolved.value && hasSlots.value)

const isSlotCheckActive = computed(
  () => isOptionsVisible.value && isResolved.value && hasSlots.value,
)

watch(isSlotCheckActive, (active) => arm(active), { immediate: true })

onMounted(() =>
  registerAnchor(() => slotsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })),
)

onBeforeUnmount(() => arm(false))

// Набор вариантов зависит от страны, и выбранного в новом наборе может не
// оказаться — тогда не выбрано ничего. Возвращаем выбор на первый.
watch(courierVariants, (list) => {
  if (!list.some((variant) => variant.id === courierVariant.value)) {
    courierVariant.value = defaultVariantId.value
  }
})

/**
 * Цена доставки в итогах. У курьера её называет выбранный вариант, у пункта
 * выдачи — сам пункт (бесплатный офис, СДЭК за 199 ₽). У ещё не заполненного
 * адреса цены нет, и строка обнуляется. Раньше пункт всегда давал ноль, и
 * платный пункт показывал цену в карточке, а в итоге оставался бесплатным.
 */
const deliveryCost = computed(() => {
  if (!isResolved.value) {
    return 0
  }

  if (isOptionsVisible.value) {
    return priceOf(courierVariant.value)
  }

  return state.value.profile?.price ?? 0
})

watch([deliveryCost, courierVariants], () => setDeliveryPrice(deliveryCost.value), {
  immediate: true,
})
</script>

<template>
  <div class="cc3-combined-checkout">
    <Cc3ModalHeader :cart-count="summary.itemsCount" />

    <!-- На широком экране сводка стоит справа, и полоса с суммой не нужна. -->
    <div class="cc3-combined-checkout__bar">
      <Cc3ModalSummaryBar>
        <!-- Раскрытая полоса показывает ту же серую карточку сводки, что и внизу страницы. -->
        <template #panel>
          <div class="cc3-combined-checkout__panel">
            <Cc3CombinedTotalCard />
          </div>
        </template>
      </Cc3ModalSummaryBar>
    </div>

    <div class="cc3-combined-checkout__body">
      <div class="cc3-combined-checkout__main">
        <Cc3CombinedDeliverySection @state="onState" />

        <section v-if="isOptionsVisible" class="cc3-combined-checkout__options">
          <h2 class="cc3-combined-checkout__options-title">{{ text.optionsTitle }}</h2>

          <Cc3CombinedDeliveryOptions v-model="courierVariant" :resolved="isResolved" />

          <div v-if="isSlotsVisible" ref="slotsRef" class="cc3-combined-checkout__slots">
            <Cc3InlineDeliverySlots
              :variant-id="courierVariant"
              :explicit="isSlotChoiceExplicit"
              carousel
            />

            <p v-if="isChoiceMissing" class="cc3-combined-checkout__slot-required" role="alert">
              {{ text.slotRequired }}
            </p>

            <Cc3CombinedNotice
              v-if="isMessageVisible"
              tone="warning"
              class="cc3-combined-checkout__slot-notice"
            >
              {{ text.slotTaken }}
            </Cc3CombinedNotice>
          </div>
        </section>

        <Cc3CombinedPaymentMethods />
        <Cc3CombinedTotalCard :merged="isSummaryMerged" />
        <Cc3CombinedExtrasCard v-if="!isSummaryMerged" outlined />
        <Cc3ModalFooterConsent ref="consentRef" :is-error-shown="isTermsErrorShown" />
        <Cc3ModalFooterCta :is-disabled="false" @submit="submit" />
      </div>

      <div class="cc3-combined-checkout__aside">
        <Cc3CombinedTotalCard :merged="isSummaryMerged" />
        <Cc3CombinedExtrasCard v-if="!isSummaryMerged" outlined />
      </div>
    </div>

    <Cc3ModalFooterSite />
  </div>
</template>

<style lang="scss">
.cc3-combined-checkout {
  color-scheme: light;

  @include cc3-light-tokens;
  @include cc3-combined-fields;

  display: flex;
  flex-direction: column;

  margin: 0 auto;
  width: 100%;

  background-color: var(--st-content-background-color-default-solid-normal);

  // Шапка общая с модальной версией и рисует свою линию. Здесь линий нет,
  // поэтому гасим её, не трогая саму модальную.
  .cc3-modal-header {
    border-bottom: none;
  }

  // Полоса с суммой нужна, пока сводка уезжает вниз страницы. В две колонки
  // сводка стоит справа на виду, и полоса только повторяла бы её.
  &__bar {
    @include mediaMinWidth('lg') {
      display: none;
    }
  }

  // Полоса «Состав заказа» без серой заливки: название, стрелка и сумма на
  // белом. Раскрывается серой карточкой сводки, как внизу страницы, поэтому
  // собственный фон и линию панели общей полосы гасим.
  .cc3-modal-summary-bar__head {
    background-color: transparent;
  }

  .cc3-modal-summary-bar__panel {
    padding: var(--st-global-distance-space-inset-xs) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-xl);

    background: none;
    border-bottom: none;
  }

  // Разделителей между блоками нет, как в макете: блоки разделяют только
  // отступы.
  //
  // До планшета страница идёт одной колонкой в таком порядке: способы,
  // сводка, галочки, кнопка. Колонки-обёртки там «растворены», а порядок
  // задан в order у самих блоков. С 1024 обёртки становятся колонками.
  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xl);

    margin: 0 auto;
    padding-top: var(--st-global-distance-space-inset-2xl);
    width: 100%;

    // Сетка как у магазина друга клуба: одна колонка не шире 560 по центру,
    // с 1024 — колонка формы 560 и колонка сводки 400 с зазором 64, всё вместе
    // по центру страницы.
    max-width: 560px;

    @include mediaMinWidth('lg') {
      display: grid;
      grid-template-columns: minmax(0, 560px) 400px;
      align-items: start;
      justify-content: center;
      column-gap: calc(var(--st-global-distance-space-inset-9xl) + var(--st-global-distance-space-inset-2xl));

      padding: var(--st-global-distance-space-inset-6xl) var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-6xl) var(--st-global-distance-space-inset-2xl);
      max-width: none;
    }
  }

  &__main,
  &__aside {
    display: contents;

    @include mediaMinWidth('lg') {
      display: flex;
      flex-direction: column;
      gap: var(--st-global-distance-space-inset-xl);

      // Колонка может быть уже своего содержимого: без этого длинная строка
      // растягивает сетку и выталкивает правую колонку за край.
      min-width: 0;
    }
  }

  // Сводка с кнопкой едет за страницей, пока человек заполняет форму слева.
  &__aside {
    @include mediaMinWidth('lg') {
      position: sticky;
      top: var(--st-global-distance-space-inset-4xl);
    }
  }

  // Порядок одной колонки. Сводка общая с модальной версией и своих отступов
  // не знает: ей нужны те же 12 сверху, что и остальным блокам с заголовком.
  &__main > .cc3-combined-delivery {
    order: 1;
  }

  &__main > .cc3-combined-checkout__options {
    order: 2;
  }

  &__main > .cc3-combined-payment {
    order: 4;
  }

  // Серые карточки внизу — суммы, а за ними кошелёк с промокодом — нужны на
  // телефоне и планшете, где другой сводки в потоке нет. В две колонки суммы
  // и товары стоят в карточке справа, а кошелёк с промокодом под ней, и
  // нижние только повторяли бы их.
  &__main > .cc3-combined-total-card,
  &__main > .cc3-combined-extras-card {
    margin: 0 var(--st-global-distance-space-inset-2xl);

    @include mediaMinWidth('lg') {
      display: none;
    }
  }

  // От способов оплаты до карточки сводки 32: к зазору колонки в 12 добавлено
  // ещё 20, чтобы сводка читалась как следующий раздел, а не продолжение
  // оплаты.
  &__main > .cc3-combined-total-card {
    order: 5;

    margin-top: var(--st-global-distance-space-inset-3xl);
  }

  &__main > .cc3-combined-extras-card {
    order: 6;
  }

  // В колонке справа карточка кошелька и промокода появляется только с
  // двумя колонками, под сводкой.
  &__aside > .cc3-combined-extras-card {
    display: none;
  }

  // Карточка сводки справа нужна только в две колонки: на телефоне вместо неё
  // стоит нижняя.
  &__aside > .cc3-combined-total-card {
    display: none;
  }

  // Галочкам нужны те же 4 сверху, что подвал раньше добавлял к зазору, а
  // кнопке, наоборот, на 12 меньше: она и галочки были одним блоком, и
  // зазор между ними задавали сами, без отступа колонки.
  &__main > .cc3-modal-footer-consent {
    order: 7;

    margin-top: var(--st-global-distance-space-inset-xs);
  }

  &__main > .cc3-modal-footer-cta {
    order: 8;

    margin-top: calc(-1 * var(--st-global-distance-space-inset-xl));
  }

  // В самовывозе вариантов доставки нет, и за блоком доставки сразу идёт
  // оплата. Блок доставки уже держит снизу свои 12, поэтому
  // собственный верхний отступ следующего блока лишний: без этой строки
  // заголовок стоял бы на 12 дальше, чем у «Вариантов доставки».
  &__main > .cc3-combined-delivery + .cc3-combined-payment {
    padding-top: 0;
  }

  // Две колонки: галочки и кнопка под способами оплаты слева, сводка справа.
  @include mediaMinWidth('lg') {
    &__aside > .cc3-combined-total-card,
    &__aside > .cc3-combined-extras-card {
      display: block;
    }

    &__main > .cc3-modal-footer-consent {
      margin-top: 0;

      // Галочка слева от текста, как в магазине друга клуба. Порядок в разметке
      // общий с остальными версиями (текст, потом галочка), поэтому меняем его
      // только здесь, а выравниваем по первой строке: текст бывает в две-три.
      .cc3-modal-footer-consent__cell {
        flex-direction: row-reverse;
        align-items: flex-start;
        justify-content: flex-end;
      }
    }
  }

  // Отступы по краям как у остальных блоков страницы: сами списки
  // ничего не знают о том, куда их поставили.
  &__options {
    padding-right: var(--st-global-distance-space-inset-2xl);
    padding-left: var(--st-global-distance-space-inset-2xl);
  }

  // Слоты — общий компонент с инлайном, там отступ над ними свой. Здесь
  // список способов стоит рамкой, и слотам нужен воздух под ней.
  &__slot-notice {
    margin-top: var(--st-global-distance-space-inset-xl);
  }

  // «Выберите время доставки» красным под рядами слотов, когда оплату нажали
  // без слота.
  &__slot-required {
    margin: var(--st-global-distance-space-inset-md) 0 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__slots {
    padding-top: var(--st-global-distance-space-inset-2xl);

    // Даты и время — маленькие таблетки (размер sm): полностью скруглённые,
    // шрифт 14, с рамкой той же толщины, что у карточек способов выше. Цвета
    // остаются нашими. Чипы общие с инлайном, поэтому оформляем их здесь, а
    // не в нём.
    .cc3-inline-delivery-slots__chip {
      padding: var(--st-global-distance-space-inset-xs) var(--st-global-distance-space-inset-xl);

      @include font('label-sm');

      border-width: 1.5px;
      border-radius: var(--st-global-radius-pill);
    }
  }

  &__options-title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) 0
      calc(var(--st-global-distance-space-inset-xl) + var(--st-global-distance-space-inset-x));

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
