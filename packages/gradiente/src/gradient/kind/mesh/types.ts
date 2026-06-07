import {
    type GradientInterpolation,
    type GradientJSON,
    type GradientLengthPercentage,
    type IGradient,
} from "../base";

/**
 * Discriminator for mesh gradient instances and serialized mesh gradient data.
 *
 * Дискриминатор для экземпляров mesh-градиента и его сериализованных данных.
 */
export type GradientMeshType = "mesh-gradient";

/**
 * Surface interpolation method used to sample colors inside mesh patches.
 *
 * Метод интерполяции поверхности, который используется для сэмплинга цветов внутри mesh-патчей.
 */
export type GradientMeshInterpolationMethod = "bilinear" | "bicubic";

/**
 * Patch edge that can carry optional cubic control handles.
 *
 * Сторона патча, на которой могут быть опциональные cubic-контрольные ручки.
 */
export type GradientMeshPatchSide = "top" | "right" | "bottom" | "left";

/**
 * Configuration for the internal mesh gradient model.
 *
 * Конфигурация внутренней модели mesh-градиента.
 *
 * @remarks
 * The grid describes the regular topology expected by renderers and samplers.
 * Vertices may still be spatially distorted: `rows` and `columns` describe topology, not visual alignment.
 *
 * Grid описывает регулярную топологию для рендереров и сэмплеров.
 * Вершины могут быть визуально искажены: `rows` и `columns` описывают топологию, а не выравнивание на плоскости.
 */
export type GradientMeshConfig = {
    /**
     * Number of vertex rows in the mesh topology.
     *
     * Количество рядов вершин в mesh-топологии.
     */
    rows: number;

    /**
     * Number of vertex columns in the mesh topology.
     *
     * Количество колонок вершин в mesh-топологии.
     */
    columns: number;

    /**
     * Color sampling method inside each patch.
     *
     * Метод сэмплинга цвета внутри каждого патча.
     */
    method: GradientMeshInterpolationMethod;

    /**
     * Color interpolation settings used when sampling mesh colors.
     *
     * Настройки цветовой интерполяции, используемые при сэмплинге цветов mesh-градиента.
     */
    interpolation: GradientInterpolation;
};

/**
 * Optional constructor config for a mesh gradient.
 *
 * Опциональная конфигурация конструктора mesh-градиента.
 *
 * @remarks
 * Every config field is optional. Missing `rows` and `columns` are inferred from vertex ids or counts when possible,
 * then fall back to the class defaults.
 *
 * Все поля config опциональны. Отсутствующие `rows` и `columns` по возможности выводятся из id вершин или количества
 * элементов, а затем заменяются дефолтами класса.
 */
export type GradientMeshConfigInput = Omit<
    Partial<GradientMeshConfig>,
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
 * Mesh vertex in Gradiente's internal model.
 *
 * Mesh-вершина во внутренней модели Gradiente.
 */
export type GradientMeshVertex = {
    /**
     * Stable vertex id referenced by patches.
     *
     * Стабильный id вершины, на который ссылаются патчи.
     */
    id: string;

    /**
     * Horizontal vertex position.
     *
     * Горизонтальная позиция вершины.
     */
    x: GradientLengthPercentage;

    /**
     * Vertical vertex position.
     *
     * Вертикальная позиция вершины.
     */
    y: GradientLengthPercentage;

    /**
     * Vertex color in any Culori-readable color format.
     *
     * Цвет вершины в любом формате, который может прочитать Culori.
     */
    color: string;
};

/**
 * Cubic handle coordinate used by mesh patch edges.
 *
 * Координата cubic-ручки, используемая сторонами mesh-патча.
 */
export type GradientMeshHandle = {
    x: GradientLengthPercentage;
    y: GradientLengthPercentage;
};

/**
 * Optional pair of edge handles for a mesh patch side.
 *
 * Опциональная пара edge-ручек для стороны mesh-патча.
 */
export type GradientMeshPatchHandle = {
    from: GradientMeshHandle;
    to: GradientMeshHandle;
};

/**
 * Optional handle map keyed by patch side.
 *
 * Опциональная карта ручек по сторонам патча.
 */
export type GradientMeshPatchHandles = Partial<
    Record<GradientMeshPatchSide, GradientMeshPatchHandle>
>;

/**
 * Mesh patch made from four unique vertex references.
 *
 * Mesh-патч, состоящий из четырех уникальных ссылок на вершины.
 */
export type GradientMeshPatch = {
    /**
     * Stable patch id.
     *
     * Стабильный id патча.
     */
    id: string;

    topLeft: string;
    topRight: string;
    bottomRight: string;
    bottomLeft: string;
    handles?: GradientMeshPatchHandles;
};

/**
 * JSON representation of a mesh gradient in Gradiente's internal model.
 *
 * JSON-представление mesh-градиента во внутренней модели Gradiente.
 */
export type GradientMeshJSON = GradientJSON<
    GradientMeshConfig,
    {
        vertices: GradientMeshVertex[];
        patches: GradientMeshPatch[];
    }
> & {
    type: GradientMeshType;
};

/**
 * Public instance contract for a mesh gradient.
 *
 * Публичный контракт экземпляра mesh-градиента.
 */
export interface IGradientMesh extends IGradient<GradientMeshConfig> {
    readonly type: GradientMeshType;

    getVertices(): GradientMeshVertex[];
    getPatches(): GradientMeshPatch[];
    getVertex(id: string): GradientMeshVertex | null;
    getPatch(id: string): GradientMeshPatch | null;
    samplePatchColor(patchId: string, u: number, v: number): string;
}
