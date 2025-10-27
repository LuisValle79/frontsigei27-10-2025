/**
 * Página de Matrícula Integrada
 * Utiliza el nuevo formulario con integración de microservicios
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IntegratedEnrollmentForm from '../components/IntegratedEnrollmentForm';
import type { Enrollment } from '../models/enrollments.model';

export const IntegratedEnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEnrollment, setCreatedEnrollment] = useState<Enrollment | null>(null);

  const handleEnrollmentCreated = (enrollment: Enrollment) => {
    setCreatedEnrollment(enrollment);
    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    navigate('/enrollments');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/enrollments');
  };

  const handleViewEnrollment = () => {
    if (createdEnrollment?.id) {
      navigate(`/enrollments/${createdEnrollment.id}`);
    }
  };

  return (
    <div className="integrated-enrollment-page">
      <div className="page-header">
        <div className="breadcrumb">
          <span onClick={() => navigate('/enrollments')} className="breadcrumb-link">
            <i className="fas fa-graduation-cap"></i>
            Matrículas
          </span>
          <i className="fas fa-chevron-right"></i>
          <span>Nueva Matrícula</span>
        </div>
      </div>

      <div className="page-content">
        <IntegratedEnrollmentForm
          onEnrollmentCreated={handleEnrollmentCreated}
          onCancel={handleCancel}
        />
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && createdEnrollment && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <i className="fas fa-check-circle success-icon"></i>
              <h2>¡Matrícula Creada Exitosamente!</h2>
            </div>

            <div className="modal-content">
              <div className="enrollment-details">
                <div className="detail-item">
                  <strong>Código de Matrícula:</strong>
                  <span>{createdEnrollment.enrollmentCode || createdEnrollment.id}</span>
                </div>
                
                <div className="detail-item">
                  <strong>Año Académico:</strong>
                  <span>{createdEnrollment.academicYear}</span>
                </div>
                
                <div className="detail-item">
                  <strong>Estado:</strong>
                  <span className={`status-badge ${createdEnrollment.enrollmentStatus?.toLowerCase()}`}>
                    {createdEnrollment.enrollmentStatus}
                  </span>
                </div>
                
                <div className="detail-item">
                  <strong>Fecha de Matrícula:</strong>
                  <span>
                    {createdEnrollment.enrollmentDate 
                      ? new Date(createdEnrollment.enrollmentDate).toLocaleDateString('es-PE')
                      : 'Hoy'
                    }
                  </span>
                </div>
              </div>

              <div className="success-message">
                <p>
                  La matrícula ha sido registrada correctamente en el sistema. 
                  Puede proceder con la documentación requerida y el proceso de inscripción.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleViewEnrollment}
                className="view-button"
              >
                <i className="fas fa-eye"></i>
                Ver Matrícula
              </button>
              
              <button
                onClick={handleCloseSuccessModal}
                className="close-button"
              >
                <i className="fas fa-list"></i>
                Ir a Lista de Matrículas
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .integrated-enrollment-page {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .page-header {
          background: white;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #2196F3;
          cursor: pointer;
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          text-decoration: underline;
        }

        .page-content {
          padding: 2rem 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .success-modal {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .success-icon {
          font-size: 4rem;
          color: #4CAF50;
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .modal-content {
          margin-bottom: 2rem;
        }

        .enrollment-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-item strong {
          color: #333;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .status-badge.pending {
          background: #FFF3E0;
          color: #F57C00;
        }

        .success-message {
          text-align: center;
          color: #666;
          line-height: 1.6;
        }

        .success-message p {
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .view-button, .close-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-button {
          background: #2196F3;
          color: white;
        }

        .view-button:hover {
          background: #1976D2;
          transform: translateY(-1px);
        }

        .close-button {
          background: #4CAF50;
          color: white;
        }

        .close-button:hover {
          background: #45a049;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 1rem;
          }

          .page-content {
            padding: 1rem 0;
          }

          .success-modal {
            margin: 1rem;
            padding: 1.5rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default IntegratedEnrollmentPage;