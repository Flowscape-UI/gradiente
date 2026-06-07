import {
    type GradientInterpolation,
    type GradientStop,
    type GradientWithStopsJSON,
    type GradientWithStopsJSONExtra,
    type IGradientWithStops,
} from "../base";

/**
 * Discriminator for linear gradient instances and serialized linear gradient data.
 *
 * Дискриминатор для экземпляров линейного градиента и его сериализованных данных.
 */
export type GradientLinearType = "linear-gradient";

/**
 * Stop model used by linear gradients.
 *
 * Модель stop-точки, которую использует линейный градиент.
 *
 * @remarks
 * This currently maps to the shared Gradiente stop model: color stops and color hints.
 *
 * Сейчас это общий stop-слой Gradiente: цветовые stop-точки и color hints.
 */
export type GradientLinearStop = GradientStop;

/**
 * Configuration for the internal linear gradient model.
 *
 * Конфигурация внутренней модели линейного градиента.
 *
 * @remarks
 * Renderer-specific concepts such as CSS direction keywords belong to parsers or serializers.
 * The core model stores geometry as a normalized numeric angle.
 *
 * Renderer-специфичные понятия, например CSS-направления через keywords, относятся к
 * парсерам или сериализаторам. В core-модели геометрия хранится как нормализованный числовой угол.
 */
export type GradientLinearConfig = GradientWithStopsJSONExtra & {
    /**
     * Direction angle in radians, normalized to the internal Gradiente angle model.
     *
     * Угол направления в радианах, нормализованный под внутреннюю модель углов Gradiente.
     */
    angle: number;

    /**
     * Color interpolation settings used between color stops.
     *
     * Настройки цветовой интерполяции между цветовыми stop-точками.
     */
    interpolation: GradientInterpolation;
};

/**
 * JSON representation of a linear gradient in Gradiente's internal model.
 *
 * JSON-представление линейного градиента во внутренней модели Gradiente.
 *
 * @remarks
 * This is not a CSS string or renderer adapter payload. It preserves the typed config and stops.
 *
 * Это не CSS-строка и не payload renderer-адаптера. Здесь сохраняются типизированные
 * config и stops.
 */
export type GradientLinearJSON = GradientWithStopsJSON<
    GradientLinearStop,
    GradientLinearConfig
> & {
    /**
     * Serialized gradient type discriminator.
     *
     * Дискриминатор типа сериализованного градиента.
     */
    type: GradientLinearType;
};

/**
 * Optional constructor config for a linear gradient.
 *
 * Опциональная конфигурация конструктора линейного градиента.
 *
 * @remarks
 * Every config field is optional. Missing values are resolved from the class defaults.
 *
 * Все поля config опциональны. Отсутствующие значения заполняются дефолтами класса.
 */
export type GradientLinearConfigInput = Omit<
    Partial<GradientLinearConfig>,
    "interpolation"
> & {
    /**
     * Optional color interpolation overrides.
     *
     * Опциональные переопределения цветовой интерполяции.
     */
    interpolation?: Partial<GradientInterpolation>;
};

/**
 * Public instance contract for a linear gradient.
 *
 * Публичный контракт экземпляра линейного градиента.
 *
 * @remarks
 * The interface exposes the renderer-agnostic model: typed config, typed stops,
 * cloning, equality, string serialization, and JSON serialization inherited from the base contract.
 *
 * Интерфейс раскрывает renderer-agnostic модель: типизированный config, типизированные stops,
 * клонирование, сравнение, строковую сериализацию и JSON-сериализацию из базового контракта.
 */
export interface IGradientLinear extends IGradientWithStops<
    GradientLinearStop,
    GradientLinearConfig
> {
    /**
     * Linear gradient type discriminator.
     *
     * Дискриминатор типа линейного градиента.
     */
    readonly type: GradientLinearType;
}
