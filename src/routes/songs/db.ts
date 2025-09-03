// db.ts
import type { Observable } from 'dexie';
import Dexie, { liveQuery, type EntityTable } from 'dexie';

interface Song {
	id: number;
	name: string;
	diskName: string;
}

interface SongLoop {
	id: number;
	songId: number;
	name: string;
	start: number;
	end: number;
}

const db = new Dexie('SongDatabase') as Dexie & {
	songs: EntityTable<
		Song,
		'id' // primary key "id" (for the typings only)
	>;
	songLoops: EntityTable<SongLoop, 'id'>;
};

// Schema declaration: (only key columns)
db.version(1).stores({
	songs: '++id', // primary key "id" (for the runtime)
	songLoops: '++id, songId',
});

db.on('populate', (tx) => {
	tx.table('songs').bulkAdd([
		{ name: 'Welcome to the Rock', diskName: 's/cfa/01_welcome_to_the_rock.m4a' },
		{ name: '38 Planes', diskName: 's/cfa/02_38_planes.m4a' },
		{ name: 'Blankets and Bedding', diskName: 's/cfa/03_blankets_and_bedding.m4a' },
		{ name: '28 Hours/Wherever We Are', diskName: 's/cfa/04_28_hours_wherever_we_are.m4a' },
		{ name: 'Darkness and Trees', diskName: 's/cfa/05_darkness_and_trees.m4a' },
		{ name: 'On the Bus', diskName: 's/cfa/06_on_the_bus.m4a' },
		{ name: 'Darkness and Trees (reprise)', diskName: 's/cfa/07_darkness_and_trees_reprise.m4a' },
		{ name: 'Lead Us Out of the Night', diskName: 's/cfa/08_lead_us_out_of_the_night.m4a' },
		{ name: 'Phoning Home', diskName: 's/cfa/09_phoning_home.m4a' },
		{ name: 'Costume Party', diskName: 's/cfa/10_costume_party.m4a' },
		{ name: 'I Am Here', diskName: 's/cfa/11_i_am_here.m4a' },
		{ name: 'Prayer', diskName: 's/cfa/12_prayer.m4a' },
		{ name: 'On the Edge', diskName: 's/cfa/13_on_the_edge.m4a' },
		{ name: 'In the Bar/Heave Away', diskName: 's/cfa/14_in_the_bar_heave_away.m4a' },
		{ name: 'Screech In', diskName: 's/cfa/15_screech_in.m4a' },
		{ name: 'Me and the Sky', diskName: 's/cfa/16_me_and_the_sky.m4a' },
		{ name: 'The Dover Fault', diskName: 's/cfa/17_the_dover_fault.m4a' },
		{ name: 'Stop the World', diskName: 's/cfa/18_stop_the_world.m4a' },
		{
			name: '38 Planes (reprise)/Somewhere in the Middle of Nowhere',
			diskName: 's/cfa/19_38_planes_reprise_somewhere_in_the_middle_of_nowhere.m4a',
		},
		{ name: "Something's Missing", diskName: "s/cfa/20_something's_missing.m4a" },
		{ name: '10 Years Later', diskName: 's/cfa/21_10_years_later.m4a' },
		{ name: 'Finale', diskName: 's/cfa/22_finale.m4a' },
		{ name: 'Screech Out', diskName: 's/cfa/23_screech_out.m4a' },
	]);
});

export type Observed<T> = T extends Observable<infer U> ? U : never;

export function getSongs() {
	return liveQuery(() => db.songs.toArray());
}

export function getSong(id: number) {
	return liveQuery(async () => {
		const [song, songLoops] = await Promise.all([
			db.songs.get(id),
			db.songLoops.where({ songId: id }).toArray(),
		]);
		if (!song) {
			throw new Error('no song found');
		}
		return {
			song,
			songLoops,
		};
	});
}

export function addLoopToSong(
	songId: number,
	details: { start: number; end: number; name?: string },
) {
	return db.songLoops.add({
		songId,
		start: details.start,
		end: details.end,
		name: details.name || `Loop at ${details.start.toFixed(2)}s`,
	});
}

export function deleteLoop(id: number) {
	return db.songLoops.delete(id);
}

export function updateLoop(id: number, updates: { start?: number; end?: number; name?: string }) {
	return db.songLoops.update(id, updates);
}
