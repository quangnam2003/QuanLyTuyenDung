using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;      
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecruitersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RecruitersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Recruiters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recruiter>>> GetRecruiters()
        {
            return await _context.Recruiters
                .Include(r => r.User)
                .ToListAsync();
        }

        // GET: api/Recruiters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Recruiter>> GetRecruiter(int id)
        {
            var recruiter = await _context.Recruiters
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.RecruiterID == id);

            if (recruiter == null)
            {
                return NotFound();
            }

            return recruiter;
        }

        // POST: api/Recruiters
        [HttpPost]
        public async Task<ActionResult<Recruiter>> PostRecruiter(Recruiter recruiter)
        {
            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRecruiter), new { id = recruiter.RecruiterID }, recruiter);
        }

        // PUT: api/Recruiters/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecruiter(int id, Recruiter recruiter)
        {
            if (id != recruiter.RecruiterID)
            {
                return BadRequest();
            }

            _context.Entry(recruiter).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecruiterExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Recruiters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecruiter(int id)
        {
            var recruiter = await _context.Recruiters.FindAsync(id);
            if (recruiter == null)
            {
                return NotFound();
            }

            _context.Recruiters.Remove(recruiter);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RecruiterExists(int id)
        {
            return _context.Recruiters.Any(e => e.RecruiterID == id);
        }
    }
}
