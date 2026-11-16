import { nextTick, ref, watch } from 'vue'

import { useAddressGuard } from '@/composables/useAddressGuard'
import { useCheckout } from '@/composables/useCheckout'
import { useSlotConflict } from '@/composables/useSlotConflict'
import { useStandOrder } from '@/stand/composables/useStandOrder'

/**
 * Нажатие «Перейти к оплате» и ошибка про условия.
 *
 * Вынесено из подвала, потому что кнопка и галочки больше не обязаны стоять
 * рядом: на широком экране комбинированной версии галочки остаются под формой,
 * а кнопка уезжает в правую колонку над сводкой. Состояние ошибки у них общее,
 * поэтому живёт здесь, а не в одном из компонентов.
 *
 * Версия без пояснений (`explainBlocked` выключен) гасит кнопку, пока условия
 * не приняты, и до ошибки дело не доходит.
 *
 * @param explainBlocked Без принятых условий кнопка остаётся активной, а нажатие
 *   объясняет причину под галочкой.
 * @param scrollToTerms Подвести экран к галочке условий, когда на неё указывает ошибка.
 */
export function useCheckoutSubmit(explainBlocked: boolean, scrollToTerms: () => void) {
  // Кнопка заканчивает прохождение: останавливает секундомер, пишет строку в
  // журнал и показывает экран благодарности. Логика замера — в ядре стенда.
  const { createOrder } = useStandOrder()
  const { acceptTerms } = useCheckout()

  /**
   * Инлайн-концепт требует сохранить адрес до заказа: там форма разворачивается
   * на самой странице и кнопка «Сохранить» стоит посреди неё. В модальном
   * концепте сторож не взведён, и проверка просто пропускает клик дальше.
   */
  const { ensureAddressSaved } = useAddressGuard()
  const { ensureSlotAvailable } = useSlotConflict()

  const isTermsErrorShown = ref(false)

  // Условия приняли — ошибка уходит сама, нажимать ещё раз не нужно.
  watch(acceptTerms, (accepted) => {
    if (accepted) {
      isTermsErrorShown.value = false
    }
  })

  function submit() {
    if (explainBlocked && !acceptTerms.value) {
      isTermsErrorShown.value = true

      void nextTick(scrollToTerms)

      return
    }

    if (!ensureAddressSaved()) {
      return
    }

    if (!ensureSlotAvailable()) {
      return
    }

    createOrder()
  }

  return { isTermsErrorShown, submit }
}
