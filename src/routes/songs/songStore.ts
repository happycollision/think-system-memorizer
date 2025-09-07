// db.ts
import type { Observable } from 'dexie';
import Dexie, { type EntityTable } from 'dexie';

interface Audio {
	diskName: string;
	file: Blob;
}

const store = new Dexie('AudioStore') as Dexie & {
	audio: EntityTable<
		Audio,
		'diskName' // primary key "id" (for the typings only)
	>;
};

// Schema declaration: (only key columns)
store.version(1).stores({
	audio: 'diskName', // primary key "id" (for the runtime)
});

export type Observed<T> = T extends Observable<infer U> ? U : never;

export function getAudio(diskName: string) {
	return store.audio.get(diskName);
}

export function putAudio(diskName: string, file: Blob) {
	return store.audio.put({ diskName, file });
}
