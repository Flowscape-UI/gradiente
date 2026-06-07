import {
    type GradientWithStopsJSON,
    type IGradientWithStops,
} from "../base";
import {
    type GradientRadialConfig,
    type GradientRadialConfigInput,
    type GradientRadialStop,
} from "../radial";

/**
 * Discriminator for diamond gradient instances and serialized diamond gradient data.
 *
 * Дискриминатор для экземпляров diamond-градиента и его сериализованных данных.
 */
export type GradientDiamondType = "diamond-gradient";

/**
 * Stop model used by diamond gradients.
 *
 * Модель stop-точки, которую использует diamond-градиент.
 */
export type GradientDiamondStop = GradientRadialStop;

/**
 * Configuration for the internal diamond gradient model.
 *
 * Конфигурация внутренней модели diamond-градиента.
 */
export type GradientDiamondConfig = GradientRadialConfig;

/**
 * Optional constructor config for a diamond gradient.
 *
 * Опциональная конфигурация конструктора diamond-градиента.
 */
export type GradientDiamondConfigInput = GradientRadialConfigInput;

/**
 * JSON representation of a diamond gradient in Gradiente's internal model.
 *
 * JSON-представление diamond-градиента во внутренней модели Gradiente.
 */
export type GradientDiamondJSON = GradientWithStopsJSON<
    GradientDiamondStop,
    GradientDiamondConfig
> & {
    type: GradientDiamondType;
};

/**
 * Public instance contract for a diamond gradient.
 *
 * Публичный контракт экземпляра diamond-градиента.
 */
export interface IGradientDiamond extends IGradientWithStops<
    GradientDiamondStop,
    GradientDiamondConfig
> {
    readonly type: GradientDiamondType;
}
