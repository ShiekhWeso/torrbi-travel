import {getRates} from '@/lib/queries';
import {saveRates} from '../../actions';

const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';

export default async function Page() {
  const rates = await getRates();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">Currency / العملة</h1>
      <form action={saveRates} className="grid gap-4 rounded-2xl bg-snow p-6">
        <label className="block text-sm font-bold text-navy">
          1 USD = ? MYR (Malaysian ringgit)
          <div className="mt-1 font-normal">
            <input name="MYR" type="number" step="0.0001" min="0" required defaultValue={rates.MYR} className={inp} />
          </div>
        </label>
        <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:w-fit">Save</button>
      </form>
    </div>
  );
}
