/**
 * Форматирует дату в российский формат (ДД.ММ.ГГГГ)
 * @param dateString - Дата в формате ISO или другом формате
 * @returns Отформатированная дата в формате ДД.ММ.ГГГГ
 */
export function formatDateToRussian(dateString: string | undefined | null): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return dateString; // Возвращаем исходную строку, если дата невалидна
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Возвращаем исходную строку при ошибке
  }
}

