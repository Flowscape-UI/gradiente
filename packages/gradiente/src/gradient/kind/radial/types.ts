import {
    type GradientInterpolation,
    type GradientLengthPercentage,
    type GradientPosition,
    type GradientStop,
    type GradientWithStopsJSON,
    type GradientWithStopsJSONExtra,
    type IGradientWithStops,
} from "../base";

/**
 * Discriminator for radial gradient instances and serialized radial gradient data.
 *
 * Дискриминатор для экземпляров радиального градиента и его сериализованных данных.
 */
export type GradientRadialType = "radial-gradient";

/**
 * Stop model used by radial gradients.
 *
 * Модель stop-точки, которую использует радиальный градиент.
 */
export type GradientRadialStop = GradientStop;

/**
 * Shape of a radial gradient.
 *
 * Форма радиального градиента.
 */
export type GradientRadialShape = "circle" | "ellipse";

/**
 * Keyword extent used to resolve radial gradient size.
 *
 * Keyword-область, через которую определяется размер радиального градиента.
 */
export type GradientRadialExtent =
    | "closest-side"
    | "closest-corner"
    | "farthest-side"
    | "farthest-corner";

/**
 * Internal size model for radial gradients.
 *
 * Внутренняя модель размера радиального градиента.
 */
export type GradientRadialSize =
    | {
        kind: "extent";
        value: GradientRadialExtent;
    }
    | {
        kind: "explicit";
        x: GradientLengthPercentage;
        y?: GradientLengthPercentage;
    };

/**
 * Configuration for the internal radial gradient model.
 *
 * Конфигурация внутренней модели радиального градиента.
 */
export type GradientRadialConfig = GradientWithStopsJSONExtra & {
    shape: GradientRadialShape;
    size: GradientRadialSize;
    position: GradientPosition;
    interpolation: GradientInterpolation;
};

/**
 * Optional constructor config for a radial gradient.
 *
 * Опциональная конфигурация конструктора радиального градиента.
 */
export type GradientRadialConfigInput = Omit<
    Partial<GradientRadialConfig>,
    "interpolation"
> & {
    interpolation?: Partial<GradientInterpolation>;
};

/**
 * JSON representation of a radial gradient in Gradiente's internal model.
 *
 * JSON-представление радиального градиента во внутренней модели Gradiente.
 */
export type GradientRadialJSON<
    TType extends string = GradientRadialType,
> = GradientWithStopsJSON<
    GradientRadialStop,
    GradientRadialConfig
> & {
    type: TType;
};

/**
 * Public instance contract for a radial gradient.
 *
 * Публичный контракт экземпляра радиального градиента.
 */
export interface IGradientRadial extends IGradientWithStops<
    GradientRadialStop,
    GradientRadialConfig
> {
    readonly type: GradientRadialType;
}
