export default function EquipmentModal() {
  return (
    <div id="equipment-modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Editează Setup Rachetă</h2>
          <button className="close-btn">&times;</button>
        </div>
        <form id="equipment-form">
          <div className="form-group">
            <label className="form-label">Forehand</label>
            <input
              type="text"
              className="form-input"
              id="forehand"
              placeholder="Ex: Tenergy 05"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Backhand</label>
            <input
              type="text"
              className="form-input"
              id="backhand"
              placeholder="Ex: Donic Barracuda"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Blade</label>
            <input
              type="text"
              className="form-input"
              id="blade"
              placeholder="Ex: Viscaria"
            />
          </div>
          <button type="submit" className="save-btn">
            Salvează Modificările
          </button>
        </form>
      </div>
    </div>
  );
}
