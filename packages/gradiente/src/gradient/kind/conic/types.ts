import {
    type GradientAngleValue,
    type GradientInterpolation,
    type GradientPosition,
    type GradientStop,
    type GradientWithStopsJSON,
    type GradientWithStopsJSONExtra,
    type IGradientWithStops,
} from "../base";

/**
 * Discriminator for conic gradient instances and serialized conic gradient data.
 *
 * Дискриминатор для экземпляров конического градиента и его сериализованных данных.
 */
export type GradientConicType = "conic-gradient";

/**
 * Stop model used by conic gradients.
 *
 * Модель stop-точки, которую использует конический градиент.
 */
export type GradientConicStop = GradientStop;

/**
 * Configuration for the internal conic gradient model.
 *
 * Конфигурация внутренней модели конического градиента.
 */
export type GradientConicConfig = GradientWithStopsJSONExtra & {
    from: GradientAngleValue;
    position: GradientPosition;
    interpolation: GradientInterpolation;
};

/**
 * Optional constructor config for a conic gradient.
 *
 * Опциональная конфигурация конструктора конического градиента.
 */
export type GradientConicConfigInput = Omit<
    Partial<GradientConicConfig>,
    "interpolation"
> & {
    interpolation?: Partial<GradientInterpolation>;
};

/**
 * JSON representation of a conic gradient in Gradiente's internal model.
 *
 * JSON-представление конического градиента во внутренней модели Gradiente.
 */
export type GradientConicJSON = GradientWithStopsJSON<
    GradientConicStop,
    GradientConicConfig
> & {
    type: GradientConicType;
};

/**
 * Public instance contract for a conic gradient.
 *
 * Публичный контракт экземпляра конического градиента.
 */
export interface IGradientConic extends IGradientWithStops<
    GradientConicStop,
    GradientConicConfig
> {
    readonly type: GradientConicType;
}
