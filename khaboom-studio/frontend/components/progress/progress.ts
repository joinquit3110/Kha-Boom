// =============================================================================
// Progress Component
// (c) Kha-Boom!
import {$N, CustomElementView, register, SVGParentView, SVGView} from '@mathigon/boost';

// Sentinel to verify inclusion in bundle.
// eslint-disable-next-line no-console
console.log('[KB DEBUG] progress module loaded');
// Non-string sentinel (object) that's unlikely to be stripped by minifiers even if console.* is removed.
// Access window.__KB_PROGRESS_SENTINEL at runtime to assert bundle inclusion.
(window as any).__KB_PROGRESS_SENTINEL = (window as any).__KB_PROGRESS_SENTINEL || {
	addedAt: Date.now(),
	tag: 'x-progress',
	version: 1,
	palette: ['#CD0E66','#FD8C00','#6B46C1','#38B2AC']
};

// Export a token to allow other modules to create a hard reference enforcing inclusion.
export const FORCE_PROGRESS_INCLUDED = 'FORCE_PROGRESS_INCLUDED_V1';

const PADDING = 12;
function getProgress(r: number) {
	return `M${r},${r/2}a${r/2},${r/2},0,0,1,0,${r}A${r/2},${r/2},0,0,1,${r},${r/2}`;
}
function getCheck(r: number) {
	return `M ${r},0 C ${r/2},0,0,${r/2},0,${r}  s ${r/2},${r},${r},${r} ` +
				 `s ${r}-${r/2},${r}-${r}     S ${r*1.5},0,${r},0 z ` +
		 `M ${r*44.6/50},${r*76.1/50} L ${r*19.2/50},${r*48.8/50} ` +
		 `l ${r*4/50}-${r*4.2/50}     l ${r*19.8/50},${r*11.9/50} ` +
		 `l ${r*34.2/50}-${r*32.6/50} l ${r*3.5/50},${r*3.5/50} ` +
		 `L ${r*44.6/50},${r*76.1/50} z`;
}

function colourForProgress(p: number) {
	if (p >= 0.99) return '#38B2AC'; 
	if (p >= 0.75) return '#6B46C1';
	if (p >= 0.5)  return '#FD8C00';
	return '#CD0E66';
}

@register('x-progress')
export class Progress extends CustomElementView {
		private r!: number;
		private r1!: number;
		private completed = false;

	private $svg!: SVGParentView;
	private $progress!: SVGView;

	ready() {
		this.r = +this.attr('r') || 10;
		this.r1 = this.r + PADDING;

		this.$svg = $N('svg', {width: 2 * this.r1, height: 2 * this.r1}, this) as SVGParentView;
		// Single foreground progress path
		this.$progress = $N('path', {
			class: 'pie', d: getProgress(this.r),
			stroke: 'currentColor', fill: 'none', 'stroke-linecap': 'round'
		}, this.$svg) as SVGView;
		const initial = +this.attr('p') || 0;
		// Apply an immediate base colour so UI isn't uncoloured before first update.
		const baseColour = colourForProgress(initial);
		this.css('color', baseColour);
		this.$progress.css('stroke', baseColour);
		this.setProgress(initial, false);
		this.onAttr('p', (p) => this.setProgress(+p, false));
	}

	setProgress(p: number, animation = true) {
		if (p > 0.99) return this.complete(animation);
		const c = Math.PI * this.r;
		const colour = colourForProgress(p);
		this.css('color', colour);
		this.$progress.css('stroke', colour);
		this.$progress.css('stroke-width', this.r);
		this.$progress.css('fill', 'none');
		const visible = Math.max(p * c, 0.0001);
		this.$progress.css('stroke-dasharray', `${visible} ${c}`);
	}

	complete(animation = true) {
		if (this.completed) return;
		this.completed = true;
		const colour = colourForProgress(1);
		this.css('color', colour);
		this.$progress.css('stroke', 'none');
		this.$progress.css('fill', colour);
		this.$progress.setAttr('d', getCheck(this.r));
	}
}

// Force side-effect retention for tree-shaking: expose on window and create one element.
(window as any).__KBProgressClass = Progress; // eslint-disable-line @typescript-eslint/no-explicit-any
try { document.createElement('x-progress'); } catch { /* ignore */ }

