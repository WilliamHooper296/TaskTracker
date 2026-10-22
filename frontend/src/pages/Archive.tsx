import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

type ArchiveRecords = Record<string, Record<string, boolean>>;

function Archive() {

  const navigate = useNavigate()

  async function retrieveArchive(): Promise<ArchiveRecords> {
    const records = await fetch(`${API_URL}/archive`, {
      credentials: 'include',
    }).then((res) => res.json());
    return records;
  }

  const [archive, setArchive] = useState<ArchiveRecords>({});
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString('en-CA'),
  );
  useEffect(() => {
    retrieveArchive().then(setArchive);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 items-center content-center p-4 m-10 border-2">
      <button onClick={() => navigate("/homepage")}>RETURN</button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => setCurrentDate(e.target.value)}
        className="border-2"
      />

      <div className="grid grid-cols-[1fr_auto] gap-4 border-2 p-4">
        {Object.keys(archive).map((name) => {
          const checked = archive[name][currentDate] ?? false;
          return (
            <div key={name} className="contents">
              <div>{name}: </div>
              <div className= {checked ? "text-green-500" : "text-red-500"}>{checked ? "COMPLETED" : "INCOMPLETE"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Archive;
