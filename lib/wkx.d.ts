/// <reference types="node" />

declare module "wkx" {

    export class Geometry {
        srid: number;
        hasZ: boolean;
        hasM: boolean;

        static parse(value: string | Buffer): Geometry;
        static parseTwkb(value: Buffer): Geometry;
        static parseGeoJSON(value: {}): Geometry;

        toWkt(): string;
        toEwkt(): string;
        toWkb(): Buffer;
        toEwkb(): Buffer;
        toTwkb(): Buffer;
        toGeoJSON(options?: GeoJSONOptions): {};
    }

    export interface GeoJSONOptions {
        shortCrs?: boolean;
        longCrs?: boolean;
    }

    export class Point extends Geometry {
        x: number;
        y: number;
        z: number;
        m: number;

        constructor(x?: number, y?: number, z?: number, m?: number);

        static Z(x: number, y: number, z: number): Point;
        static M(x: number, y: number, m: number): Point;
        static ZM(x: number, y: number, z: number, m: number): Point;
    }

    export class LineString extends Geometry {
        points: Point[];

        constructor(points?: Point[]);
        
        static Z(points?: Point[]): LineString;
        static M(points?: Point[]): LineString;
        static ZM(points?: Point[]): LineString;
    }

    export class Polygon extends Geometry {
        exteriorRing: Point[];
        interiorRings: Point[][];

        constructor(exteriorRing?: Point[], interiorRings?: Point[][]);

        static Z(exteriorRing?: Point[], interiorRings?: Point[][]): Polygon;
        static M(exteriorRing?: Point[], interiorRings?: Point[][]): Polygon;
        static ZM(exteriorRing?: Point[], interiorRings?: Point[][]): Polygon;
    }

    export class MultiPoint extends Geometry {
        points: Point[];

        constructor(points?: Point[]);
        
        static Z(points?: Point[]): MultiPoint;
        static M(points?: Point[]): MultiPoint;
        static ZM(points?: Point[]): MultiPoint;
    }

    export class MultiLineString extends Geometry {
        lineStrings: LineString[];

        constructor(lineStrings?: LineString[]);
        
        static Z(lineStrings?: LineString[]): MultiLineString;
        static M(lineStrings?: LineString[]): MultiLineString;
        static ZM(lineStrings?: LineString[]): MultiLineString;
    }

    export class MultiPolygon extends Geometry {
        polygons: Polygon[];

        constructor(polygons?: Polygon[]);
        
        static Z(polygons?: Polygon[]): MultiPolygon;
        static M(polygons?: Polygon[]): MultiPolygon;
        static ZM(polygons?: Polygon[]): MultiPolygon;
    }

    export class GeometryCollection extends Geometry {
        geometries: Geometry[];

        constructor(geometries?: Geometry[]);
        
        static Z(geometries?: Geometry[]): GeometryCollection;
        static M(geometries?: Geometry[]): GeometryCollection;
        static ZM(geometries?: Geometry[]): GeometryCollection;
    }
}